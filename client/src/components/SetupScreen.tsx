import { useState, useEffect } from 'react';
import type { Category } from "../types";
import { 
  FaGoogle, 
  FaGithub, 
  FaListUl, 
  FaSortNumericDown, 
  FaRocket, 
  FaSignInAlt,
  FaCheck,
  FaCheckDouble 
} from 'react-icons/fa';

interface SetupScreenProps {
  categories: Category[]; 
  onStart: (config: { limit: number; categoryIds: number[] }) => void;
  onLogin: (provider: 'github' | 'google') => void;
  isLoggedIn: boolean;
}

export const SetupScreen = ({ categories, onStart, onLogin, isLoggedIn }: SetupScreenProps) => {
  const [limit, setLimit] = useState(10);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);

  useEffect(() => {
    if (Array.isArray(categories) && categories.length > 0) {
       // 필요하다면 초기 전체 선택 로직
    }
  }, [categories]);

  const toggleCategory = (id: number) => {
    setSelectedCats(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCats.length === categories.length) {
      setSelectedCats([]);
    } else {
      setSelectedCats(categories.map(c => c.categoryId));
    }
  };

  const handleStart = () => {
    if (selectedCats.length === 0) return alert('최소 하나의 카테고리를 선택해주세요!');
    onStart({ limit, categoryIds: selectedCats });
  };

  const safeCategories = Array.isArray(categories) ? categories : [];
  const isAllSelected = safeCategories.length > 0 && selectedCats.length === safeCategories.length;

  return (
    <div className="setup-container card">
      <h1>CS Quiz App</h1>
      
      {/* 1. 로그인 섹션 (로그인 안 했을 때만 보임) */}
      {!isLoggedIn && (
        <>
          <div className="auth-section">
            <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', color: 'var(--sub-text)' }}>
               <FaSignInAlt />
               로그인하고 기록을 저장하세요
            </p>
            <div className="auth-buttons">
              <button className="auth-btn google" onClick={() => onLogin('google')}>
                <FaGoogle style={{ marginRight: '8px' }} /> Google
              </button>
              <button className="auth-btn github" onClick={() => onLogin('github')}>
                <FaGithub style={{ marginRight: '8px' }} /> GitHub
              </button>
            </div>
          </div>
          {/* 구분선도 로그인 안 했을 때만 필요 */}
          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid var(--border-color)' }} />
        </>
      )}

      {/* 2. 퀴즈 설정 섹션 */}
      <div className="settings-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3>
                <FaListUl style={{ marginRight: '8px' }} /> 카테고리 선택
            </h3>
            
            <button 
                onClick={handleSelectAll}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
            >
                <FaCheckDouble /> {isAllSelected ? '전체 해제' : '전체 선택'}
            </button>
        </div>
        
        <div className="category-grid">
          {safeCategories.length > 0 ? (
            safeCategories.map(cat => {
              const isSelected = selectedCats.includes(cat.categoryId);
              return (
                <button
                  key={cat.categoryId}
                  className={`cat-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleCategory(cat.categoryId)}
                >
                  {isSelected && <FaCheck style={{ marginRight: '6px', fontSize: '0.8rem' }} />}
                  {cat.categoryName}
                </button>
              );
            })
          ) : (
             <div style={{ gridColumn: '1 / -1', color: 'var(--error-color)', textAlign: 'center' }}>
                카테고리 데이터를 불러오지 못했습니다.
             </div>
          )}
        </div>

        <h3 style={{ marginTop: '30px' }}>
            <FaSortNumericDown style={{ marginRight: '8px' }} /> 
            문제 수 설정: {limit}문제
        </h3>
        <input 
          type="range" 
          min="5" 
          max="50" 
          step="5" 
          value={limit} 
          onChange={(e) => setLimit(Number(e.target.value))} 
          className="slider"
        />
      </div>

      <button className="start-btn-large" onClick={handleStart}>
        <FaRocket style={{ marginRight: '8px' }} /> 퀴즈 시작하기
      </button>
    </div>
  );
};