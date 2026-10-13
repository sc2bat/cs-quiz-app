import { apiClient } from './axiosClient';

export const adminApi = {
  listTracks: async () => {
    const { data } = await apiClient.get('/api/admin/tracks');
    return data.data as any[];
  },
  createTrack: async (body: any) => {
    const { data } = await apiClient.post('/api/admin/tracks', body);
    return data.data;
  },
  updateTrack: async (trackId: number, body: any) => {
    const { data } = await apiClient.patch(`/api/admin/tracks/${trackId}`, body);
    return data.data;
  },
  deleteTrack: async (trackId: number) => {
    await apiClient.delete(`/api/admin/tracks/${trackId}`);
  },
  listCategories: async (trackId: number) => {
    const { data } = await apiClient.get('/api/admin/categories', { params: { trackId } });
    return data.data as any[];
  },
  createCategory: async (body: any) => {
    const { data } = await apiClient.post('/api/admin/categories', body);
    return data.data;
  },
  deleteCategory: async (categoryId: number) => {
    await apiClient.delete(`/api/admin/categories/${categoryId}`);
  },
  listQuestions: async (categoryId: number) => {
    const { data } = await apiClient.get('/api/admin/questions', { params: { categoryId } });
    return data.data as any[];
  },
  createQuestion: async (body: any) => {
    const { data } = await apiClient.post('/api/admin/questions', body);
    return data.data;
  },
  deleteQuestion: async (questionId: number) => {
    await apiClient.delete(`/api/admin/questions/${questionId}`);
  },
};
