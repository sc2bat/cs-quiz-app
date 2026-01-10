import type { Category, Question, QuizHistoryItem, QuizRecordPayload } from "../types";
import logger from "../utils/logger";
import { apiClient } from "./axiosClient";

export const quizApi = {
    fetchQuizzes: async (categoryIds: number[], limit: number = 10): Promise<Question[]> => {
        logger.info('quizApi fetchQuizzes');
        const response = await apiClient.get(`/api/quiz/quizzes`, {
            params: {
                categoryIds: categoryIds.join(','),
                quizLimit: limit
            }
        });
        logger.debug(response.data.status);
        logger.debug(response.data.data.length);
        return response.data.data;
    },
    fetchCategories: async (): Promise<Category[]> => {
        logger.info('quizApi fetchCategories');
        const response = await apiClient.get(`/api/quiz/categories`);
        logger.debug(`result length: ${response.data.data.length}`);

        return response.data.data;
    },
    saveQuizResult: async (payload: QuizRecordPayload) => {
        try {
            const response = await apiClient.post('/api/quiz/records', payload);
            logger.info('Quiz result saved successfully');
            return response.data; // { message, quizRecordId }
        } catch (error) {
            logger.error('Failed to save quiz result', error);
            throw error;
        }
    },
    getQuizHistory: async () => {
        try {
            const response = await apiClient.get<{ data: QuizHistoryItem[] }>('/api/quiz/records');
            return response.data.data;
        } catch (error) {
            logger.error('Failed to fetch quiz history', error);
            throw error;
        }
    }
}