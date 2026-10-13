import { apiClient } from "./axiosClient";
import type { ApiResponse, Category } from "../types";

export const quizApi = {
    fetchQuizzes: async (
        categoryIds: number[],
        options?: { trackSlug?: string; quizLimit?: number; mode?: 'practice' | 'exam' }
    ): Promise<ApiResponse> => {
        const response = await apiClient.get<ApiResponse>(`/api/quiz/quizzes`, {
            params: {
                categoryIds: categoryIds.join(','),
                ...(options?.trackSlug ? { track: options.trackSlug } : {}),
                ...(options?.quizLimit ? { quizLimit: options.quizLimit } : {}),
                ...(options?.mode === 'exam' ? { mode: 'exam' } : {}),
            }
        });
        return response.data;
    },
    fetchQuestionsByIds: async (
        questionIds: number[],
        trackSlug?: string
    ): Promise<ApiResponse> => {
        const response = await apiClient.get<ApiResponse>(`/api/quiz/questions`, {
            params: {
                ids: questionIds.join(','),
                ...(trackSlug ? { track: trackSlug } : {}),
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
    submitExam: async (payload: {
        trackId: number;
        answers: {
            questionId: number;
            choiceId?: number | null;
            subjectiveAnswer?: string | null;
        }[];
    }) => {
        const { data } = await apiClient.post('/api/quiz/exam/submit', payload);
        return data.data as {
            score: number;
            total: number;
            quizRecordId: number | null;
            details: {
                questionId: number;
                isCorrect: boolean;
                explanation: string | null;
                correctChoiceIds: number[];
                subjectiveAnswer: string | null;
            }[];
        };
    },
};
