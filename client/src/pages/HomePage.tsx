import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrackSelect } from '../components';
import { trackApi } from '../api/trackApi';
import type { Track } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setTracks(await trackApi.fetchTracks());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '트랙 로딩 실패');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <TrackSelect
      tracks={tracks}
      loading={loading}
      error={error}
      onSelect={(track) => navigate(`/tracks/${track.slug}`)}
    />
  );
}
