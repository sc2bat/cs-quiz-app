import { apiClient } from './axiosClient';
import type { Category, Track } from '../types';

export const trackApi = {
  fetchTracks: async (): Promise<Track[]> => {
    const { data } = await apiClient.get<{ status: string; data: Track[] }>('/api/tracks');
    return data.data;
  },
  fetchCategoriesByTrack: async (
    slug: string
  ): Promise<{ track: Track; categories: Category[] }> => {
    const { data } = await apiClient.get<{
      status: string;
      data: { track: Track; categories: Category[] };
    }>(`/api/tracks/${slug}/categories`);
    return data.data;
  },
};
