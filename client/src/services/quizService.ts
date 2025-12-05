import { apiClient } from "../api/axiosClient";
import type { ApiResponse } from "../types";

export const quizService = {
    fetchQuizzes: async (): Promise<ApiResponse> => {
        const response = await apiClient.get<ApiResponse>(`/api/quizzes`);
        return response.data;
    }
}