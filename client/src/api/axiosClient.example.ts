/**
 * Example only. The real client is axiosClient.ts (uses VITE_QUIZ_API_BASE_URL).
 * Copy this if you need a local override template.
 */
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 15000,
  withCredentials: true,
});
