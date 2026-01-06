import { FaCog, FaTimes, FaUserCircle, FaBrain } from 'react-icons/fa';
import type { AppMode } from '../types';

interface HeaderProps {
  appMode: AppMode;
  onOpenSettings: () => void;
  onQuitQuiz: () => void;
  isLoggedIn: boolean;
}

export const Header = ({ appMode, onOpenSettings, onQuitQuiz, isLoggedIn }: HeaderProps) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <FaBrain style={{ marginRight: '8px', fontSize: '1.4rem' }} />
          CS Quiz
        </div>
      </div>

      <div className="header-right">
        {/* 1. 로그인 상태 표시 */}
        {isLoggedIn && (
          <div className="user-badge">
            <FaUserCircle style={{ marginRight: '5px', fontSize: '1.1rem' }} />
            User
          </div>
        )}

        {/* 2. 모드에 따른 버튼 변경 */}
        {appMode === 'PLAYING' ? (
          // [게임 중] -> 중단 버튼
          <button className="header-btn quit" onClick={onQuitQuiz} aria-label="퀴즈 중단">
            <FaTimes /> <span className="btn-text">중단</span>
          </button>
        ) : (
          // [설정/대기 중] -> 설정 버튼
          <button className="header-btn settings" onClick={onOpenSettings} aria-label="설정">
            <FaCog />
          </button>
        )}
      </div>
    </header>
  );
};