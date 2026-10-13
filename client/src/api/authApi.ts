import { apiClient } from './axiosClient';

const apiBase = (import.meta.env.VITE_QUIZ_API_BASE_URL as string | undefined) || '';

export const authApi = {
  getGoogleLoginUrl: () => `${apiBase}/api/auth/google`,
  getGithubLoginUrl: () => `${apiBase}/api/auth/github`,

  exchangeCode: async (code: string): Promise<string> => {
    const { data } = await apiClient.post<{ status: string; token: string }>(
      '/api/auth/exchange',
      { code }
    );
    return data.token;
  },

  logout: async () => {
    await apiClient.post('/api/auth/logout');
  },
};
