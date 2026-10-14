import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { TrackSelect, LoginModal } from '../components';
import { trackApi } from '../api/trackApi';
import { getStoredNickname, getTokenRole, useAuth } from '../auth/AuthContext';
import type { Track } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, sessionExpired, acknowledgeSessionExpired } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
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

  useEffect(() => {
    if (sessionExpired) setLoginOpen(true);
  }, [sessionExpired]);

  return (
    <div>
      {sessionExpired && (
        <p className="error" style={{ maxWidth: 640, margin: '0 auto 12px' }}>
          세션이 만료되었습니다. 다시 로그인해 주세요.
        </p>
      )}
      <div className="auth-bar">
        {isLoggedIn ? (
          <>
            <span className="auth-bar__user">
              <FaUserCircle className="auth-bar__icon" aria-hidden />
              {nickname || '로그인됨'}
            </span>
            <button type="button" className="ghost-btn" onClick={() => navigate('/history')}>
              풀이 기록
            </button>
            {isAdmin && (
              <button type="button" className="ghost-btn" onClick={() => navigate('/admin')}>
                Admin
              </button>
            )}
            <button type="button" className="ghost-btn" onClick={() => logout()}>
              <FaSignOutAlt aria-hidden /> 로그아웃
            </button>
          </>
        ) : (
          <button
            type="button"
            className="login-btn-trigger"
            onClick={() => setLoginOpen(true)}
          >
            로그인
          </button>
        )}
      </div>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          acknowledgeSessionExpired();
        }}
      />

      <TrackSelect
        tracks={tracks}
        loading={loading}
        error={error}
        onSelect={(track) => navigate(`/tracks/${track.slug}`)}
      />
    </div>
  );
}
