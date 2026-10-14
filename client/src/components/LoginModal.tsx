import { FaGithub, FaGoogle, FaTimes } from 'react-icons/fa';
import { authApi } from '../api/authApi';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="presentation"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="닫기">
          <FaTimes />
        </button>

        <h2 id="login-modal-title" className="modal-title">
          로그인
        </h2>
        <p className="modal-desc">소셜 계정으로 간편하게 시작하세요</p>

        <div className="login-buttons">
          <a className="sso-btn google" href={authApi.getGoogleLoginUrl()}>
            <FaGoogle className="btn-icon" />
            <span>Continue with Google</span>
          </a>
          <a className="sso-btn github" href={authApi.getGithubLoginUrl()}>
            <FaGithub className="btn-icon" />
            <span>Continue with GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
}
