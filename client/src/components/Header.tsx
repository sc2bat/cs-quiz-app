import { FaCog, FaTimes, FaUserCircle, FaBrain, FaSignOutAlt } from 'react-icons/fa';
import type { AppMode } from '../types';
import type { User } from '../types/user';
import { useState } from 'react';
import { LoginModal } from './LoginModal';

interface HeaderProps {
  appMode: AppMode;
  onOpenSettings: () => void;
  onQuitQuiz: () => void;
  user: User | null;         // user info
  onLogin: (provider: any) => void; // login action
  onLogout: () => void;
}

export const Header = ({
  appMode,
  onOpenSettings,
  onQuitQuiz,
  user,
  onLogin,
  onLogout
}: HeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLoginClick = (provider: any) => {
    onLogin(provider);
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <div className="header-logo">
            <FaBrain style={{ marginRight: '8px', fontSize: '1.4rem' }} />
            CS Quiz
          </div>
        </div>

        <div className="header-right">
          {user ? (
            <div className="user-info">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="profile" className="user-avatar" />
              ) : (
                <FaUserCircle className="user-icon-default" />
              )}
              <span className="user-nickname">{user.nickname}</span>

              <button
                onClick={onLogout}
                className="header-icon-btn logout"
                title="Log out"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <button
              className="login-btn-trigger"
              onClick={() => setIsModalOpen(true)}
            >
              Log in
            </button>
          )}

          {appMode === 'PLAYING' ? (
            <button
              className="header-btn quit"
              onClick={onQuitQuiz}
              aria-label="Quit quiz"
            >
              <FaTimes /> <span className="btn-text">Quit</span>
            </button>
          ) : (
            <button
              className="header-btn settings"
              onClick={onOpenSettings}
              aria-label="Settings"
            >
              <FaCog />
            </button>
          )}
        </div>
      </header>
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogin={handleLoginClick}
      />
    </>
  );
};
