import { apiClient } from './axiosClient';
import type { Category, Question, Track } from '../types';

export type AdminTrackInput = {
  slug: string;
  name: string;
  description?: string;
  defaults?: unknown;
  isActive?: boolean;
};

export type AdminCategoryInput = {
  trackId: number;
  name: string;
  sortOrder?: number;
};

export type AdminChoiceInput = {
  choiceText: string;
  isCorrect: boolean;
};

export type AdminQuestionInput = {
  categoryId: number;
  questionType: string;
  questionText: string;
  explanation?: string;
  subjectiveAnswer?: string | null;
  choices?: AdminChoiceInput[];
};

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return 'Request failed';
}

export const adminApi = {
  listTracks: async (): Promise<Track[]> => {
    const { data } = await apiClient.get('/api/admin/tracks');
    return data.data as Track[];
  },
  createTrack: async (body: AdminTrackInput) => {
    const { data } = await apiClient.post('/api/admin/tracks', body);
    return data.data;
  },
  updateTrack: async (trackId: number, body: AdminTrackInput) => {
    const { data } = await apiClient.patch(`/api/admin/tracks/${trackId}`, body);
    return data.data;
  },
  deleteTrack: async (trackId: number) => {
    await apiClient.delete(`/api/admin/tracks/${trackId}`);
  },
  listCategories: async (trackId: number): Promise<Category[]> => {
    const { data } = await apiClient.get('/api/admin/categories', { params: { trackId } });
    return data.data as Category[];
  },
  createCategory: async (body: AdminCategoryInput) => {
    const { data } = await apiClient.post('/api/admin/categories', body);
    return data.data;
  },
  deleteCategory: async (categoryId: number) => {
    await apiClient.delete(`/api/admin/categories/${categoryId}`);
  },
  listQuestions: async (categoryId: number): Promise<Question[]> => {
    const { data } = await apiClient.get('/api/admin/questions', { params: { categoryId } });
    return data.data as Question[];
  },
  createQuestion: async (body: AdminQuestionInput) => {
    const { data } = await apiClient.post('/api/admin/questions', body);
    return data.data;
  },
  deleteQuestion: async (questionId: number) => {
    await apiClient.delete(`/api/admin/questions/${questionId}`);
  },
  errMessage,
};
