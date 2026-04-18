import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

// Keep browser requests on the frontend origin so the Next.js API route can
// proxy them to the correct backend service. This avoids direct browser calls
// to backend ports like 8001/8002/8003/8004/8005.
const DEFAULT_API_BASE = '/api';

const api = axios.create({
  baseURL: DEFAULT_API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

const AUTH_STORAGE_KEYS = [
  'evently_token',
  'evently_user',
  'access_token',
  'refresh_token',
  'user',
  'token_expires_at',
] as const;

function readStoredValue(key: (typeof AUTH_STORAGE_KEYS)[number]) {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function clearStoredAuth() {
  if (typeof window === 'undefined') return;

  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  document.cookie = 'evently_token=; Path=/; Max-Age=0; SameSite=Lax';
}

function getAuthToken() {
  if (typeof window === 'undefined') return null;

  const storedToken =
    readStoredValue('evently_token') || readStoredValue('access_token');
  if (storedToken) return storedToken;

  const cookieToken = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('evently_token='))
    ?.split('=')[1];

  return cookieToken ? decodeURIComponent(cookieToken) : null;
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;

  const rawUser = readStoredValue('evently_user') || readStoredValue('user');
  if (!rawUser) return null;

  try {
    const parsedUser = JSON.parse(rawUser) as {
      id?: string | number;
      name?: string | null;
      email?: string | null;
    } | null;

    if (!parsedUser || typeof parsedUser !== 'object') {
      return null;
    }

    return {
      id:
        parsedUser.id !== undefined && parsedUser.id !== null
          ? String(parsedUser.id)
          : undefined,
      name: parsedUser.name || undefined,
      email: parsedUser.email || undefined,
    };
  } catch {
    return null;
  }
}

function normalizeSessionUser(user: unknown) {
  if (!user || typeof user !== 'object') {
    return null;
  }

  const sessionUser = user as {
    id?: string | number;
    name?: string | null;
    email?: string | null;
  };

  return {
    id:
      sessionUser.id !== undefined && sessionUser.id !== null
        ? String(sessionUser.id)
        : undefined,
    name: sessionUser.name || undefined,
    email: sessionUser.email || undefined,
  };
}

function isAuthEndpoint(config: any) {
  const url = String(config?.url || '');
  return url.includes('/users/login') || url.includes('/users/signup');
}

api.interceptors.request.use(async (config) => {
  let token = getAuthToken();
  let storedUser = getStoredUser();

  if (!token || !storedUser?.id) {
    try {
      const session = await getSession();
      token = token || session?.accessToken || null;
      storedUser = storedUser || normalizeSessionUser(session?.user);
    } catch {
      // Fall back to storage/cookie auth only.
    }
  }

  const headers = (config.headers || {}) as any;

  const setHeader = (name: string, value: string) => {
    if (typeof headers.set === 'function') {
      headers.set(name, value);
    } else {
      headers[name] = value;
    }
  };

  if (token) {
    setHeader('Authorization', `Bearer ${token}`);
  }

  if (storedUser?.id) {
    setHeader('X-Evently-User-Id', String(storedUser.id));
  }

  if (storedUser?.name) {
    setHeader('X-Evently-User-Name', String(storedUser.name));
  }

  if (storedUser?.email) {
    setHeader('X-Evently-User-Email', String(storedUser.email));
  }

  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthFailure =
      err.response?.status === 401 ||
      (err.response?.status === 403 && err.response?.data?.detail === 'Not authenticated');

    if (isAuthFailure && typeof window !== 'undefined' && !isAuthEndpoint(err.config)) {
      clearStoredAuth();
      void signOut({ callbackUrl: '/signin' }).catch(() => {
        window.location.href = '/signin';
      });
    }
    return Promise.reject(err);
  }
);

export default api;
