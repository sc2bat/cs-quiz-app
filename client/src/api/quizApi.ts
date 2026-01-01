import { apiClient } from "./axiosClient";
import type { ApiResponse } from "../types";

export const quizApi = {
    fetchQuizzes: async (): Promise<ApiResponse> => {
        console.log('quizServicequizService');
        const response = await apiClient.get<ApiResponse>(`/api/quiz/quizzes`);
        console.log(response.data);
        return response.data;
    }
}