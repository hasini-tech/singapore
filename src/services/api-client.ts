'use client';

import { getApiBaseUrl } from '@/utils/api-base-url';

// ──────────────────────────────────────────────
// Centralised HTTP client with automatic
//   • Bearer-token injection
//   • 401 → silent token refresh → retry
//   • Refresh failure → hard logout
// ──────────────────────────────────────────────

type TokenStore = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  onAuthFailure: () => void; // called when refresh also fails
};

// ── singleton state ──────────────────────────
let _tokenStore: TokenStore | null = null;
let _refreshPromise: Promise<boolean> | null = null; // dedup concurrent refreshes

const BASE_URL = getApiBaseUrl();

// ── public helpers ───────────────────────────
/**
 * Called **once** from <AuthProvider> to wire the store into the client.
 */
export function configureApiClient(store: TokenStore) {
  _tokenStore = store;
}

// ── storage helpers ──────────────────────────
function getStorage(): Storage {
  // whichever storage the token currently lives in
  if (typeof window === 'undefined') return localStorage; // SSR guard
  return localStorage.getItem('access_token') ? localStorage : sessionStorage;
}

function getAccessToken(): string | null {
  if (_tokenStore) return _tokenStore.getAccessToken();
  return (
    localStorage.getItem('access_token') ??
    sessionStorage.getItem('access_token')
  );
}

function getRefreshToken(): string | null {
  if (_tokenStore) return _tokenStore.getRefreshToken();
  return (
    localStorage.getItem('refresh_token') ??
    sessionStorage.getItem('refresh_token')
  );
}

// ── token refresh ────────────────────────────
async function doRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!data.access_token) return false;

    // persist new tokens
    const storage = getStorage();
    storage.setItem('access_token', data.access_token);
    _tokenStore?.setAccessToken(data.access_token);

    if (data.refresh_token) {
      storage.setItem('refresh_token', data.refresh_token);
      _tokenStore?.setRefreshToken(data.refresh_token);
    }

    // persist expiry
    if (data.expires_in) {
      const expiresAt = Date.now() + data.expires_in * 1000;
      storage.setItem('token_expires_at', expiresAt.toString());
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Refresh the access token. Multiple concurrent callers share the same
 * in-flight request to avoid race conditions.
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (!_refreshPromise) {
    _refreshPromise = doRefresh().finally(() => {
      _refreshPromise = null;
    });
  }
  return _refreshPromise;
}

// ── core fetch wrapper ───────────────────────
export interface ApiRequestInit extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  /** Set to true when the request uses X-API-Key instead of Bearer */
  useApiKey?: boolean;
  apiKey?: string;
  /** Skip the 401-retry logic (used internally for the refresh call) */
  _skipRetry?: boolean;
}

/**
 * Drop-in replacement for `fetch()` that:
 * 1. Injects `Authorization: Bearer …` (or `X-API-Key`)
 * 2. Retries once on 401 after refreshing the access token
 * 3. Calls `onAuthFailure` (→ logout) if the refresh also fails
 */
export async function apiFetch(
  path: string,
  init: ApiRequestInit = {}
): Promise<Response> {
  const {
    useApiKey,
    apiKey,
    _skipRetry,
    headers: extraHeaders,
    ...rest
  } = init;

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  // build headers
  const headers: Record<string, string> = {
    ...(rest.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...extraHeaders,
  };

  if (useApiKey && apiKey) {
    headers['X-API-Key'] = apiKey;
  } else {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...rest, headers });

  // ── handle 401 ───────────────────────────
  if (response.status === 401 && !_skipRetry && !useApiKey) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // retry the original request with the fresh token
      const newToken = getAccessToken();
      if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
      return fetch(url, { ...rest, headers });
    }

    // refresh failed → hard logout
    _tokenStore?.onAuthFailure();
  }

  return response;
}

/**
 * Convenience: calls `apiFetch` then parses JSON, throwing on non-2xx.
 */
export async function apiRequest<T>(
  path: string,
  init: ApiRequestInit = {}
): Promise<T> {
  const response = await apiFetch(path, init);

  if (!response.ok) {
    const errorData: any = await response.json().catch(() => ({}));
    const message =
      typeof errorData.detail === 'string'
        ? errorData.detail
        : Array.isArray(errorData.detail)
          ? errorData.detail[0]?.msg
          : errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  // handle 204 No Content
  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}
