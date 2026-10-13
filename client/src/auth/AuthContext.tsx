import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '../constants';
import { authApi } from '../api/authApi';

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  loginWithToken: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function decodeNickname(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return typeof payload.nickname === 'string' ? payload.nickname : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  );

  const loginWithToken = useCallback((next: string) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, next);
    const nickname = decodeNickname(next);
    if (nickname) localStorage.setItem(STORAGE_KEYS.AUTH_NICKNAME, nickname);
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
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_NICKNAME);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isLoggedIn: Boolean(token),
      loginWithToken,
      logout,
    }),
    [token, loginWithToken, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getStoredNickname() {
  return localStorage.getItem(STORAGE_KEYS.AUTH_NICKNAME);
}
