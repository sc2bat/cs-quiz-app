import { apiClient } from "./axiosClient";
import type { ApiResponse, Category } from "../types";

export const quizApi = {
    fetchQuizzes: async (categoryIds: number[]): Promise<ApiResponse> => {
        const response = await apiClient.get<ApiResponse>(`/api/quiz/quizzes`, {
            params: {
                categoryIds: categoryIds.join(',')
            }
        });
        return response.data;
    },
    fetchCategories: async (): Promise<Category[]> => {
        const { data } = await apiClient.get<{ status: string; data: Category[] }>(
            `/api/quiz/categories`
        );
        return data.data;
    },
};
