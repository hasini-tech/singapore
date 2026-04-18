'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  configureApiClient,
  refreshAccessToken as doRefreshAccessToken,
} from '@/services/api-client';
import { getApiBaseUrl } from '@/utils/api-base-url';

// ── types ────────────────────────────────────
interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarURL?: string | null;
  coverImageURL?: string | null;
  headline?: string | null;
  companyName?: string | null;
  location?: string | null;
  role?: string;
  isVerified?: boolean;
  [key: string]: any;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  /** Seconds until the access token expires */
  expires_in?: number;
  user?: User;
  message?: string;
  detail?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── helpers ──────────────────────────────────
const API = getApiBaseUrl();

const AUTH_STORAGE_KEYS = [
  'access_token',
  'refresh_token',
  'user',
  'token_expires_at',
  'evently_token',
  'evently_user',
];

function activeStorage(): Storage {
  if (typeof window === 'undefined') return localStorage;
  return localStorage.getItem('access_token') ? localStorage : sessionStorage;
}

function clearAllAuth() {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  if (typeof document !== 'undefined') {
    document.cookie = 'evently_token=; Path=/; Max-Age=0; SameSite=Lax';
  }
}

function persistLegacyAuthSession(
  user: User,
  accessToken: string,
  refreshToken: string | null
) {
  if (typeof window === 'undefined') return;

  const normalizedUser = {
    id: String(user.id ?? ''),
    name:
      user.name ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.email ||
      'Event Host',
    email: user.email || '',
  };

  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('evently_token', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('evently_user', JSON.stringify(normalizedUser));

  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  } else {
    localStorage.removeItem('refresh_token');
  }

  document.cookie = `evently_token=${encodeURIComponent(accessToken)}; Path=/; SameSite=Lax`;
}

// ── provider ─────────────────────────────────
import { useSession, signOut } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Sync with next-auth session
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (session) {
      setUser(session.user as User);
      setAccessToken(session.accessToken ?? null);
      setRefreshTokenState(session.refreshToken ?? null);
      setIsLoading(false);
    } else {
      // Check legacy local storage fallback if needed, but primarily rely on next-auth
      const storage = activeStorage();
      const storedAccessToken = storage.getItem('access_token');
      
      if (!storedAccessToken) {
        setUser(null);
        setAccessToken(null);
        setRefreshTokenState(null);
      } else {
        // Hydrate from legacy storage so the session continues working even if next-auth fails the client fetch
        setAccessToken(storedAccessToken);
        setRefreshTokenState(storage.getItem('refresh_token'));
        try {
          const storedUser = storage.getItem('user');
          if (storedUser) setUser(JSON.parse(storedUser));
        } catch (err) {
          // Ignore parsing errors
        }
      }
      setIsLoading(false);
    }
  }, [session, status]);

  // Fetch full profile from /auth/me to hydrate user with real data
  // This handles existing sessions where JWT doesn't have profile fields
  const profileFetchedRef = useRef(false);
  useEffect(() => {
    profileFetchedRef.current = false;
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || profileFetchedRef.current) return;
    profileFetchedRef.current = true;

    (async () => {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        const profile = (await res.json()) as Record<string, any>;
        setUser((prev) => ({
          ...prev,
          id: String(profile.id),
          email: profile.emailAddress || prev?.email || '',
          name: `${profile.firstName} ${profile.lastName}`,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarURL: profile.avatarURL,
          coverImageURL: profile.coverImageURL,
          headline: profile.headline,
          companyName: profile.companyName,
          location: profile.location,
          role: profile.role,
          isVerified: profile.isVerified,
        }));
      } catch {
        // Profile fetch failed, user object stays as-is from session
      }
    })();
  }, [accessToken]);

  useEffect(() => {
    if (status !== 'authenticated' || !user || !accessToken) {
      return;
    }

    persistLegacyAuthSession(user, accessToken, refreshToken);
  }, [status, user, accessToken, refreshToken]);

  // refs so the api-client callbacks never capture stale values
  const accessTokenRef = useRef(accessToken);
  const refreshTokenRef = useRef(refreshToken);
  accessTokenRef.current = accessToken;
  refreshTokenRef.current = refreshToken;

  // proactive-refresh timer
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── logout ───────────────────────────────
  const logout = useCallback(() => {
    clearAllAuth();
    setUser(null);
    setAccessToken(null);
    setRefreshTokenState(null);

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    signOut({ callbackUrl: '/signin' });
  }, []);

  // ── wire api-client (once) ──────────────
  useEffect(() => {
    configureApiClient({
      getAccessToken: () => accessTokenRef.current,
      getRefreshToken: () => refreshTokenRef.current,
      setAccessToken: (t: string) => setAccessToken(t),
      setRefreshToken: (t: string) => setRefreshTokenState(t),
      onAuthFailure: () => logout(),
    });
  }, [logout]);

  // login function updated to use next-auth's signIn if called from elsewhere, 
  // but usually sign-in happens via the sign-in form explicitly.
  const login = async (email: string, password: string, rememberMe = false) => {
    // This login function is kept for compatibility but should use next-auth's signIn in the UI
    throw new Error('Please use next-auth signIn for authentication');
  };

  const handleRefresh = useCallback(async (): Promise<boolean> => {
    // next-auth handles its own refresh or we handle it in auth-options
    return true;
  }, []);

  // ── value ────────────────────────────────
  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    login,
    logout,
    refreshAccessToken: handleRefresh,
    isLoading: status === 'loading' || isLoading,
    loading: status === 'loading' || isLoading,
    isAuthenticated: status === 'authenticated' || (!!accessToken && !!user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
