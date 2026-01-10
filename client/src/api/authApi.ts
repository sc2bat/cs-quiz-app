import { apiClient } from "./axiosClient";
import logger from "../utils/logger";
import type { RawUserFromDB, User } from "../types/user";


export const authApi = {
  // 세션 확인
  checkSession: async (): Promise<User | null> => {
    logger.info('authApi checkSession');
    try {
      const response = await apiClient.get<RawUserFromDB>('/auth/');
      logger.debug(`checkSession status: ${response.status}`);

      const rawData = response.data;

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
    await apiClient.post('/auth/logout');
  },

  // 로그인 (OAuth 리다이렉트 URL 생성)
  getLoginUrl: (provider: 'google' | 'github') => {
    // 환경변수에서 API URL 가져오기 (axiosClient의 baseURL 활용 가능하면 베스트)
    const API_URL = import.meta.env.VITE_QUIZ_API_BASE_URL || 'http://localhost:4000';
    return `${API_URL}/auth/${provider}`;
  }
};