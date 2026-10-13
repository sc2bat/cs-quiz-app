import { useNavigate } from 'react-router-dom';

export default function LoginFailedPage() {
  const navigate = useNavigate();
  return (
    <div className="error-panel">
      <div className="error">소셜 로그인에 실패했습니다.</div>
      <button type="button" className="next-btn" onClick={() => navigate('/')}>
        홈으로
      </button>
    </div>
  );
}
