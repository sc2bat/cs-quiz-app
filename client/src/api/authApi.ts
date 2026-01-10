import { apiClient } from "./axiosClient";
import logger from "../utils/logger";
import type { AuthResponse, User } from "../types/user";


export const authApi = {
  // 세션 확인
  checkSession: async (): Promise<User | null> => {
    logger.info('authApi checkSession');
    try {
      const response = await apiClient.get<AuthResponse>('/api/auth/me');
      logger.debug(`checkSession status: ${response.status}`);

      const rawData = response.data.user;

      if (!rawData) return null;

      const user: User = {
        userId: rawData.user_id,
        email: rawData.email,
        nickname: rawData.nickname,
        profileImageUrl: rawData.profile_image_url,
        provider: rawData.provider,
        role: rawData.role,
        lastLoginAt: rawData.last_login_at
      };

      return user;
    } catch (error: any) {
      // 401, 403 에러 null 반환
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logger.debug('User is not logged in');
        return null;
      }
      logger.error('checkSession error', error);
      throw error;
    }
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    logger.info('authApi logout');
    await apiClient.post('/api/auth/logout');
  },

  // 로그인 (OAuth 리다이렉트 URL 생성)
  getLoginUrl: (provider: 'google' | 'github') => {
    const API_URL = import.meta.env.VITE_QUIZ_API_BASE_URL || 'http://localhost:4000';
    return `${API_URL}/api/auth/${provider}`;
  }
};