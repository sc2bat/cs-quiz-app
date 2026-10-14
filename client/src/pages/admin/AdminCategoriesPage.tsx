import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import type { Category, Track } from '../../types';

export default function AdminCategoriesPage() {
  const { trackId: trackIdParam } = useParams();
  const trackId = Number(trackIdParam);
  const navigate = useNavigate();

  const [track, setTrack] = useState<Track | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const tracks = await adminApi.listTracks();
    const found = tracks.find((t) => t.trackId === trackId) ?? null;
    setTrack(found);
    if (!found) return;
    setCategories(await adminApi.listCategories(trackId));
  };

  useEffect(() => {
    if (!trackId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const tracks = await adminApi.listTracks();
        const found = tracks.find((t) => t.trackId === trackId) ?? null;
        if (cancelled) return;
        setTrack(found);
        if (found) {
          setCategories(await adminApi.listCategories(trackId));
        }
      } catch (e: unknown) {
        if (!cancelled) setError(adminApi.errMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trackId]);

  if (!trackId || (!loading && !track)) {
    return (
      <div className="error-panel">
        <div className="error">트랙을 찾을 수 없습니다.</div>
        <Link className="next-btn" to="/admin">
          트랙 목록
        </Link>
      </div>
    );
  }

  return (
    <>
      <nav className="admin-breadcrumb" aria-label="breadcrumb">
        <Link to="/admin">트랙</Link>
        <span aria-hidden>/</span>
        <span className="admin-breadcrumb__current">{track?.name || '…'}</span>
      </nav>

      <header className="admin-header">
        <div>
          <h1>카테고리</h1>
          <p className="admin-hint">
            <strong>{track?.name}</strong> 트랙에 과목/단원을 추가하거나, 카테고리를 눌러 문제를
            관리하세요.
          </p>
        </div>
        <button type="button" className="ghost-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '닫기' : '+ 카테고리 추가'}
        </button>
      </header>

      {message && <p className="admin-msg">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">불러오는 중…</p>}

      {showForm && (
        <section className="admin-section">
          <h2>새 카테고리 · {track?.name}</h2>
          <div className="admin-form">
            <input
              placeholder="예: 데이터베이스, 소프트웨어공학"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <button
              type="button"
              className="next-btn"
              disabled={!categoryName.trim()}
              onClick={async () => {
                try {
                  await adminApi.createCategory({ trackId, name: categoryName.trim() });
                  setCategoryName('');
                  setShowForm(false);
                  setMessage('카테고리 생성 완료');
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
        {categories.map((c) => (
          <li key={c.categoryId}>
            <button
              type="button"
              className="admin-card"
              onClick={() => navigate(`/admin/tracks/${trackId}/categories/${c.categoryId}`)}
            >
              <strong>{c.name}</strong>
              <span className="admin-card__meta">#{c.categoryId}</span>
              <span className="admin-card__cta">문제 관리 →</span>
            </button>
            <button
              type="button"
              className="ghost-btn admin-card__delete"
              onClick={async () => {
                if (!confirm(`"${c.name}" 카테고리를 삭제할까요?`)) return;
                try {
                  await adminApi.deleteCategory(c.categoryId);
                  setMessage('카테고리 삭제됨');
                  await reload();
                } catch (e: unknown) {
                  setError(adminApi.errMessage(e));
                }
              }}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
      {!loading && categories.length === 0 && (
        <p className="admin-empty">이 트랙에 카테고리가 없습니다. 먼저 과목을 추가하세요.</p>
      )}
    </>
  );
}
