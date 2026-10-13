import { apiClient } from "./axiosClient";
import type { ApiResponse, Category } from "../types";

export const quizApi = {
    fetchQuizzes: async (
        categoryIds: number[],
        options?: { trackSlug?: string; quizLimit?: number }
    ): Promise<ApiResponse> => {
        const response = await apiClient.get<ApiResponse>(`/api/quiz/quizzes`, {
            params: {
                categoryIds: categoryIds.join(','),
                ...(options?.trackSlug ? { track: options.trackSlug } : {}),
                ...(options?.quizLimit ? { quizLimit: options.quizLimit } : {}),
            }
        });
        return response.data;
    },
    fetchCategories: async (trackSlug?: string): Promise<Category[]> => {
        const { data } = await apiClient.get<{ status: string; data: Category[] }>(
            `/api/quiz/categories`,
            {
                params: trackSlug ? { track: trackSlug } : undefined,
            }
        );
        return data.data;
    },
};
