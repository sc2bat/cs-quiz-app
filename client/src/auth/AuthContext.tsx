import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '../constants';
import { authApi } from '../api/authApi';
import {
  clearAuthStorage,
  decodeJwtPayload,
  getStoredToken,
  isTokenExpired,
} from './token';

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  loginWithToken: (token: string) => void;
  logout: () => Promise<void>;
  sessionExpired: boolean;
  acknowledgeSessionExpired: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function decodeNickname(token: string): string | null {
  const payload = decodeJwtPayload(token);
  return typeof payload?.nickname === 'string' ? payload.nickname : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSession = useCallback((expired: boolean) => {
    clearAuthStorage();
    setToken(null);
    if (expired) setSessionExpired(true);
  }, []);

  const loginWithToken = useCallback((next: string) => {
    if (isTokenExpired(next)) {
      clearAuthStorage();
      setToken(null);
      setSessionExpired(true);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, next);
    const nickname = decodeNickname(next);
    if (nickname) localStorage.setItem(STORAGE_KEYS.AUTH_NICKNAME, nickname);
    setSessionExpired(false);
    setToken(next);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) {
        await authApi.logout();
      }
    } catch {
      // ignore network logout errors
    }
    clearSession(false);
    setSessionExpired(false);
  }, [clearSession]);

  const acknowledgeSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  // Drop expired JWT without waiting for an API 401
  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!stored) return;
      if (isTokenExpired(stored)) {
        clearSession(true);
      }
    };
    sync();
    const id = window.setInterval(sync, 30_000);
    const onFocus = () => sync();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [clearSession]);

  // Allow axios interceptor to force logout
  useEffect(() => {
    const onExpired = () => clearSession(true);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [clearSession]);

  const value = useMemo(
    () => ({
      token,
      isLoggedIn: Boolean(token) && !isTokenExpired(token),
      loginWithToken,
      logout,
      sessionExpired,
      acknowledgeSessionExpired,
    }),
    [token, loginWithToken, logout, sessionExpired, acknowledgeSessionExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
}

export function getStoredNickname() {
  if (!getStoredToken()) return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_NICKNAME);
}

export function getTokenRole(): string | null {
  const token = getStoredToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return typeof payload.role === 'string'
    ? payload.role
    : typeof payload.user_role === 'string'
      ? payload.user_role
      : null;
}
