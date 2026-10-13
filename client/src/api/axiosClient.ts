import axios from 'axios';

const baseURL = import.meta.env.VITE_QUIZ_API_BASE_URL as string | undefined;

if (!baseURL) {
  console.warn('[axiosClient] VITE_QUIZ_API_BASE_URL is not set');
}

export const apiClient = axios.create({
  baseURL: baseURL || '',
  timeout: 15000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const serverMessage = error.response?.data?.message as string | undefined;

    let message = serverMessage || error.message || 'Request failed';
    if (!serverMessage) {
      if (status === 401) message = 'Unauthorized';
      else if (status === 404) message = 'Not found';
      else if (status === 500) message = 'Server error';
      else if (!error.response) message = 'Network error';
    }

    return Promise.reject(new Error(message));
  }
);
