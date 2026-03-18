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

// ── types ────────────────────────────────────
interface User {
  id: string;
  email: string;
  name?: string;
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
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── helpers ──────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const AUTH_STORAGE_KEYS = [
  'access_token',
  'refresh_token',
  'user',
  'token_expires_at',
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
      setAccessToken((session as any).accessToken);
      setIsLoading(false);
    } else {
      // Check legacy local storage fallback if needed, but primarily rely on next-auth
      const storedAccessToken = activeStorage().getItem('access_token');
      if (!storedAccessToken) {
        setUser(null);
        setAccessToken(null);
      }
      setIsLoading(false);
    }
  }, [session, status]);

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
    isAuthenticated: status === 'authenticated' || (!!accessToken && !!user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
