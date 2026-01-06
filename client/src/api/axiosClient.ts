import axios, { AxiosError } from 'axios';
import logger from '../utils/logger';

const QUIZ_API_BASE_URL = import.meta.env.VITE_QUIZ_API_BASE_URL;

if (!QUIZ_API_BASE_URL) console.warn('API_BASE_URL is missing. Please check your environment configuration.');

export const apiClient = axios.create({
    baseURL: QUIZ_API_BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
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

