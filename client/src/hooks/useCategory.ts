import { useState, useEffect } from 'react';
import type { Category } from '../types';
import { quizApi } from '../api/quizApi';
import logger from '../utils/logger';

export const useCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await quizApi.fetchCategories();
        setCategories(data);
        logger.debug('[useCategory] Loaded:', data);
      } catch (err: any) {
        logger.error('[useCategory] Error:', err);
        setError('카테고리를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};