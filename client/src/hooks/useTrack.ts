import { useEffect, useState } from 'react';
import { trackApi } from '../api/trackApi';
import type { Track } from '../types';

export function useTrack(slug: string) {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const tracks = await trackApi.fetchTracks();
        const found = tracks.find((t) => t.slug === slug) ?? null;
        if (!cancelled) {
          setTrack(found);
          if (!found) setError('트랙을 찾을 수 없습니다.');
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setTrack(null);
          setError(err instanceof Error ? err.message : '트랙 로딩 실패');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (slug) load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { track, loading, error };
}
