import axios, { AxiosError } from 'axios';
import logger from '../utils/logger';

export const QUIZ_API_BASE_URL = import.meta.env.VITE_QUIZ_API_BASE_URL;

if (!QUIZ_API_BASE_URL) console.warn('API_BASE_URL is missing. Please check your environment configuration.');

export const apiClient = axios.create({
    baseURL: QUIZ_API_BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // include cookies for session-based authentication
});

interface ErrorResponse {
    message?: string;
}

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError<ErrorResponse>) => {

        let message = 'An unknown error has occured';

        if (error.response) {
            const status = error.response.status;
            const requestUrl = error.config?.url;

            if (status === 401) {
                if (requestUrl && requestUrl.includes('/auth/me')) {
                    return Promise.reject(error);
                }
                logger.warn(`[Session Expired] Request to ${requestUrl} failed with 401`);

                return Promise.reject(error);
            }

            const serverMessage = error.response.data?.message;
            
            logger.info(`status >> ${status}`);
            logger.info(`serverMessage >> ${serverMessage}`);

            if (status == 404) message = `Resource not found ${status}`;
            else if (status == 500) message = `Internal server error occurred ${status}`;
            else message = `Error occurred ${status}`;

        } else if (error.request) {
            message = 'Unable to connect to the server. Please check backend availability.'
        }

        const customError = new Error(message);
        return Promise.reject(customError);
    }
);

