import { apiClient } from "./axiosClient";
import type { ApiResponse, Category } from "../types";

export const quizApi = {
    fetchQuizzes: async (categoryIds: number[]): Promise<ApiResponse> => {
        console.log('quizApi');
        const response = await apiClient.get<ApiResponse>(`/api/quiz/quizzes`, {
            params: {
                categoryIds: categoryIds.join(',')
            }
        });
        console.log(response.data);
        return response.data;
    },
    fetchCategories: async (): Promise<number[]> => {
        console.log('fetchCategories');
        const { data } = await apiClient.get(`/api/quiz/categories`);

        return data.data.map((item: any) => item.category_id);
    },
}