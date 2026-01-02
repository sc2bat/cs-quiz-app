import { apiClient } from "./axiosClient";
import type { ApiResponse } from "../types";
import logger from "../utils/logger";

export const quizApi = {
    fetchQuizzes: async (categoryIds: number[]): Promise<ApiResponse> => {
        logger.info('quizApi fetchQuizzes');
        const response = await apiClient.get<ApiResponse>(`/api/quiz/quizzes`, {
            params: {
                categoryIds: categoryIds.join(',')
            }
        });
        logger.debug(response.data);
        return response.data;
    },
    fetchCategories: async (): Promise<number[]> => {
        logger.info('quizApi fetchCategories');
        const { data } = await apiClient.get(`/api/quiz/categories`);

        return data.data.map((item: any) => item.category_id);
    },
}