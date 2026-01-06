import { apiClient } from "./axiosClient";
import type { Category, Question } from "../types";
import logger from "../utils/logger";

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
}