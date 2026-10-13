import { apiClient } from './axiosClient';

export const wrongAnswerApi = {
  list: async (trackId?: number) => {
    const { data } = await apiClient.get<{
      status: string;
      data: { questionId: number; trackId: number }[];
    }>('/api/quiz/wrong-answers', {
      params: trackId ? { trackId } : undefined,
    });
    return data.data;
  },
  merge: async (trackId: number, questionIds: number[]) => {
    const { data } = await apiClient.post<{
      status: string;
      data: { questionId: number }[];
    }>('/api/quiz/wrong-answers/merge', { trackId, questionIds });
    return data.data;
  },
  clearTrack: async (trackId: number) => {
    await apiClient.delete('/api/quiz/wrong-answers', {
      params: { trackId },
    });
  },
};
