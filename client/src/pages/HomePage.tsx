import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrackSelect } from '../components';
import { trackApi } from '../api/trackApi';
import { authApi } from '../api/authApi';
import { getStoredNickname, getTokenRole, useAuth } from '../auth/AuthContext';
import type { Track } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nickname = getStoredNickname();
  const isAdmin = getTokenRole() === 'ADMIN';

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
    <div>
      <div className="auth-bar">
        {isLoggedIn ? (
          <>
            <span className="auth-bar__user">{nickname || '로그인됨'}</span>
            <button type="button" className="ghost-btn" onClick={() => navigate('/history')}>
              풀이 기록
            </button>
            {isAdmin && (
              <button type="button" className="ghost-btn" onClick={() => navigate('/admin')}>
                Admin
              </button>
            )}
            <button type="button" className="ghost-btn" onClick={() => logout()}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <a className="ghost-btn auth-bar__link" href={authApi.getGoogleLoginUrl()}>
              Google 로그인
            </a>
            <a className="ghost-btn auth-bar__link" href={authApi.getGithubLoginUrl()}>
              GitHub 로그인
            </a>
          </>
        )}
      </div>

      <TrackSelect
        tracks={tracks}
        loading={loading}
        error={error}
        onSelect={(track) => navigate(`/tracks/${track.slug}`)}
      />
    </div>
  );
}
