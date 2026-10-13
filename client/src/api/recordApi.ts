import { apiClient } from './axiosClient';

export interface QuizRecord {
  quiz_record_id: number;
  user_id: number;
  track_id: number;
  score: number;
  total_questions: number;
  taken_at: string;
}

export const recordApi = {
  create: async (payload: {
    trackId: number;
    score: number;
    totalQuestions: number;
  }) => {
    const { data } = await apiClient.post('/api/quiz/records', payload);
    return data as { quizRecordId: number };
  },
  list: async (options?: { trackId?: number; limit?: number }) => {
    const { data } = await apiClient.get<{ status: string; data: QuizRecord[] }>(
      '/api/quiz/records',
      {
        params: {
          ...(options?.trackId ? { trackId: options.trackId } : {}),
          ...(options?.limit ? { limit: options.limit } : {}),
        },
      }
    );
    return data.data;
  },
  deleteBulk: async (quizRecordIds: number[]) => {
    const { data } = await apiClient.delete('/api/quiz/records', {
      data: { quizRecordIds },
    });
    return data as { deletedCount: number };
  },
};
