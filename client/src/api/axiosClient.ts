import axios from 'axios';
import { STORAGE_KEYS } from '../constants';
import { clearAuthStorage, isTokenExpired } from '../auth/token';

const baseURL = import.meta.env.VITE_QUIZ_API_BASE_URL as string | undefined;

if (!baseURL) {
  console.warn('[axiosClient] VITE_QUIZ_API_BASE_URL is not set');
}

export const apiClient = axios.create({
  baseURL: baseURL || '',
  timeout: 15000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    if (isTokenExpired(token)) {
      clearAuthStorage();
      window.dispatchEvent(new Event('auth:expired'));
      return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해 주세요.'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const serverMessage = error.response?.data?.message as string | undefined;

    if (status === 401 || status === 403) {
      clearAuthStorage();
      window.dispatchEvent(new Event('auth:expired'));
    }

    let message = serverMessage || error.message || 'Request failed';
    if (!serverMessage) {
      if (status === 401 || status === 403) {
        message = '세션이 만료되었습니다. 다시 로그인해 주세요.';
      } else if (status === 404) message = 'Not found';
      else if (status === 500) message = 'Server error';
      else if (!error.response) message = 'Network error';
    }

    return Promise.reject(new Error(message));
  }
);
