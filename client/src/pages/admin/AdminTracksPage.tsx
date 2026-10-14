import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import type { Track } from '../../types';

export default function AdminTracksPage() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [trackForm, setTrackForm] = useState({ slug: '', name: '', description: '' });

  const reload = async () => {
    setTracks(await adminApi.listTracks());
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.listTracks();
        if (!cancelled) setTracks(data);
      } catch (e: unknown) {
        if (!cancelled) setError(adminApi.errMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <nav className="admin-breadcrumb" aria-label="breadcrumb">
        <span className="admin-breadcrumb__current">트랙</span>
      </nav>
      <header className="admin-header">
        <div>
          <h1>트랙 선택</h1>
          <p className="admin-hint">문제를 넣을 자격증/트랙을 고르세요. (예: 정보처리기사)</p>
        </div>
        <button type="button" className="ghost-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '닫기' : '+ 트랙 추가'}
        </button>
      </header>

      {message && <p className="admin-msg">{message}</p>}
      {error && <p className="error">{error}</p>}

      {showForm && (
        <section className="admin-section">
          <h2>새 트랙</h2>
          <div className="admin-form admin-form--col">
            <label className="admin-label">
              slug (영문 URL용)
              <input
                value={trackForm.slug}
                placeholder="engineer-ipe"
                onChange={(e) => setTrackForm({ ...trackForm, slug: e.target.value })}
              />
            </label>
            <label className="admin-label">
              이름
              <input
                value={trackForm.name}
                placeholder="정보처리기사"
                onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })}
              />
            </label>
            <label className="admin-label">
              설명
              <input
                value={trackForm.description}
                placeholder="선택"
                onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
              />
            </label>
            <button
              type="button"
              className="next-btn"
              onClick={async () => {
                try {
                  setError('');
                  await adminApi.createTrack(trackForm);
                  setMessage(`트랙 "${trackForm.name}" 생성 완료`);
                  setTrackForm({ slug: '', name: '', description: '' });
                  setShowForm(false);
                  await reload();
                } catch (e: unknown) {
                  setError(adminApi.errMessage(e));
                }
              }}
            >
              저장
            </button>
          </div>
        </section>
      )}

      <ul className="admin-card-list">
        {tracks.map((t) => (
          <li key={t.trackId}>
            <button
              type="button"
              className="admin-card"
              onClick={() => navigate(`/admin/tracks/${t.trackId}`)}
            >
              <strong>{t.name}</strong>
              <span className="admin-card__meta">{t.slug}</span>
              {t.description && <span className="admin-card__desc">{t.description}</span>}
              <span className="admin-card__cta">카테고리 관리 →</span>
            </button>
            <button
              type="button"
              className="ghost-btn admin-card__delete"
              onClick={async (e) => {
                e.stopPropagation();
                if (!confirm(`"${t.name}" 트랙을 삭제할까요? (하위 데이터 FK 주의)`)) return;
                try {
                  await adminApi.deleteTrack(t.trackId);
                  setMessage('트랙 삭제됨');
                  await reload();
                } catch (err: unknown) {
                  setError(adminApi.errMessage(err));
                }
              }}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
      {tracks.length === 0 && !error && <p className="admin-empty">등록된 트랙이 없습니다.</p>}
    </>
  );
}
