import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth, getTokenRole } from '../../auth/AuthContext';
import LoginModal from '../../components/LoginModal';

export default function AdminLayout() {
  const { isLoggedIn, sessionExpired, acknowledgeSessionExpired, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = getTokenRole() === 'ADMIN';

  if (!isLoggedIn) {
    return (
      <div className="error-panel">
        <div className="error">
          {sessionExpired
            ? '세션이 만료되었습니다. 다시 로그인해 주세요.'
            : '로그인이 필요합니다.'}
        </div>
        <div className="result-actions">
          <button
            type="button"
            className="next-btn"
            onClick={() => {
              acknowledgeSessionExpired();
              navigate('/');
            }}
          >
            홈으로 이동
          </button>
        </div>
        <LoginModal
          isOpen
          onClose={() => {
            acknowledgeSessionExpired();
            navigate('/');
          }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="error-panel">
        <div className="error">ADMIN 권한이 필요합니다. (docs/ADMIN.md 참고)</div>
        <button type="button" className="next-btn" onClick={() => navigate('/')}>
          홈
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <button type="button" className="link-btn" onClick={() => navigate('/')}>
          ← 홈
        </button>
        <button type="button" className="ghost-btn" onClick={() => void logout()}>
          로그아웃
        </button>
      </div>
      <Outlet />
    </div>
  );
}
