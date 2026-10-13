import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../auth/AuthContext';
import { STORAGE_KEYS } from '../constants';
import { wrongAnswerApi } from '../api/wrongAnswerApi';
import { trackApi } from '../api/trackApi';

export default function LoginSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const code = params.get('code');
      if (!code) {
        setError('로그인 코드가 없습니다.');
        return;
      }
      try {
        const token = await authApi.exchangeCode(code);
        loginWithToken(token);

        // Merge local wrong answers into server per track
        try {
          const tracks = await trackApi.fetchTracks();
          for (const track of tracks) {
            const key = `${STORAGE_KEYS.WRONG_ANSWER}:${track.slug}`;
            const local = JSON.parse(localStorage.getItem(key) || '[]') as number[];
            if (local.length === 0) continue;
            const merged = await wrongAnswerApi.merge(track.trackId, local);
            localStorage.setItem(
              key,
              JSON.stringify(merged.map((row) => row.questionId))
            );
          }
        } catch (syncErr) {
          console.warn('wrong-answer sync failed', syncErr);
        }

        navigate('/', { replace: true });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '로그인 처리 실패');
      }
    };
    run();
  }, [params, loginWithToken, navigate]);

  if (error) {
    return (
      <div className="error-panel">
        <div className="error">{error}</div>
        <button type="button" className="next-btn" onClick={() => navigate('/')}>
          홈으로
        </button>
      </div>
    );
  }

  return <div className="loading">로그인 처리 중...</div>;
}
