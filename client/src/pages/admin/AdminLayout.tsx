import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth, getTokenRole } from '../../auth/AuthContext';

export default function AdminLayout() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const isAdmin = getTokenRole() === 'ADMIN';

  if (!isLoggedIn) {
    return (
      <div className="error-panel">
        <div>로그인이 필요합니다.</div>
        <button type="button" className="next-btn" onClick={() => navigate('/')}>
          홈
        </button>
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
      <button type="button" className="link-btn" onClick={() => navigate('/')}>
        ← 홈
      </button>
      <Outlet />
    </div>
  );
}
