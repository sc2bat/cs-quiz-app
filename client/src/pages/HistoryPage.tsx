import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordApi, type QuizRecord } from '../api/recordApi';
import { trackApi } from '../api/trackApi';
import { useAuth } from '../auth/AuthContext';
import type { Track } from '../types';

export default function HistoryPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackId, setTrackId] = useState<number | 'all'>('all');
  const [records, setRecords] = useState<QuizRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    trackApi.fetchTracks().then(setTracks).catch(() => undefined);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await recordApi.list({
          trackId: trackId === 'all' ? undefined : trackId,
          limit: 30,
        });
        setRecords(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '기록 로딩 실패');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoggedIn, trackId]);

  if (!isLoggedIn) {
    return (
      <div className="error-panel">
        <div>로그인 후 풀이 기록을 볼 수 있습니다.</div>
        <button type="button" className="next-btn" onClick={() => navigate('/')}>
          홈으로
        </button>
      </div>
    );
  }

  const trackName = (id: number) =>
    tracks.find((t) => t.trackId === id)?.name || `track #${id}`;

  const handleDelete = async (id: number) => {
    if (!confirm('이 기록을 삭제할까요?')) return;
    await recordApi.deleteBulk([id]);
    setRecords((prev) => prev.filter((r) => r.quiz_record_id !== id));
  };

  return (
    <div className="history-page">
      <button type="button" className="link-btn" onClick={() => navigate('/')}>
        ← 홈
      </button>
      <h1>풀이 기록</h1>

      <label className="history-filter">
        트랙
        <select
          value={trackId === 'all' ? 'all' : String(trackId)}
          onChange={(e) =>
            setTrackId(e.target.value === 'all' ? 'all' : Number(e.target.value))
          }
        >
          <option value="all">전체</option>
          {tracks.map((t) => (
            <option key={t.trackId} value={t.trackId}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      {loading && <div className="loading">불러오는 중...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && records.length === 0 && <p>저장된 기록이 없습니다.</p>}

      <ul className="history-list">
        {records.map((r) => (
          <li key={r.quiz_record_id} className="history-item">
            <div>
              <strong>{trackName(r.track_id)}</strong>
              <div>
                {r.score} / {r.total_questions}
              </div>
              <div className="history-item__meta">
                {new Date(r.taken_at).toLocaleString()}
              </div>
            </div>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => handleDelete(r.quiz_record_id)}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
