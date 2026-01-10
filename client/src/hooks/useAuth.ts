import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import logger from '../utils/logger';
import type { User } from '../types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await authApi.checkSession();
      setUser(userData);
    } catch (err: any) {
      logger.error('[useAuth] checkAuth Error:', err);
      setError('Failed to load authentication information.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (provider: 'google' | 'github') => {
    logger.info(`[useAuth] Redirecting to ${provider} login`);
    window.location.href = authApi.getLoginUrl(provider);
  };

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authApi.logout();
      setUser(null);
      window.location.href = '/'; 
    } catch (err: any) {
      logger.error('[useAuth] logout Error:', err);
      setError('An error occurred while logging out.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    state: {
      user,
      isLoggedIn: !!user,
      loading,
      error
    },
    actions: {
      login,
      logout,
      checkAuth
    }
  };
};