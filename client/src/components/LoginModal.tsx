import { FaGithub, FaGoogle, FaTimes } from 'react-icons/fa';
import type { AuthProvider } from '../types/user';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: AuthProvider) => void;
}

export const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2 className="modal-title">Sign In</h2>
        <p className="modal-desc">Get started easily with your social account</p>

        <div className="login-buttons">
          <button 
            className="sso-btn google" 
            onClick={() => onLogin('google')}
          >
            <FaGoogle className="btn-icon" />
            <span>Continue with Google</span>
          </button>

          <button 
            className="sso-btn github" 
            onClick={() => onLogin('github')}
          >
            <FaGithub className="btn-icon" />
            <span>Continue with GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
