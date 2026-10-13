import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CategorySelect } from '../components';
import { trackApi } from '../api/trackApi';
import type { Category, Track } from '../types';

export default function CategoryPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const [track, setTrack] = useState<Track | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await trackApi.fetchCategoriesByTrack(slug);
        setTrack(data.track);
        setCategories(data.categories);
        setSelectedIds(data.categories.map((c) => c.categoryId));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '카테고리 로딩 실패');
        setTrack(null);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
  }, [slug]);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!track && !loading) {
    return (
      <div className="error-panel">
        <div className="error">{error || '트랙을 찾을 수 없습니다.'}</div>
        <button type="button" className="next-btn" onClick={() => navigate('/')}>
          홈으로
        </button>
      </div>
    );
  }

  return (
    <CategorySelect
      track={track || { trackId: 0, slug, name: '', description: null, defaults: null }}
      categories={categories}
      selectedIds={selectedIds}
      loading={loading}
      error={error}
      onToggle={toggle}
      onSelectAll={() => setSelectedIds(categories.map((c) => c.categoryId))}
      onClear={() => setSelectedIds([])}
      onBack={() => navigate('/')}
      onStart={() =>
        navigate(`/tracks/${slug}/quiz?cats=${selectedIds.join(',')}`)
      }
    />
  );
}
