import { STORAGE_KEYS } from '../constants';

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const raw = token.split('.')[1];
    if (!raw) return null;
    return JSON.parse(atob(raw)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  // small skew so we treat near-expiry as expired
  return payload.exp * 1000 <= Date.now() + 5_000;
}

export function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH_NICKNAME);
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearAuthStorage();
    return null;
  }
  return token;
}
