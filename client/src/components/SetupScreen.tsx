import { useState, useEffect } from 'react';
import type { Category } from "../types";
import { 
  FaListUl, 
  FaSortNumericDown, 
  FaRocket, 
  FaCheck,
  FaCheckDouble 
} from 'react-icons/fa';

interface SetupScreenProps {
  categories: Category[]; 
  onStart: (config: { limit: number; categoryIds: number[] }) => void;
}

export const SetupScreen = ({ categories, onStart }: SetupScreenProps) => {
  const [limit, setLimit] = useState(10);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);

  // 카테고리 로드 시 초기값 설정 (필요 시 로직 추가, 현재는 빈 값)
  useEffect(() => {
    if (Array.isArray(categories) && categories.length > 0) {
       // 예: 전체 선택을 기본으로 하고 싶다면 아래 주석 해제
       // setSelectedCats(categories.map(c => c.categoryId));
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
      
      <div className="settings-section">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3>
                <FaListUl style={{ marginRight: '8px' }} /> 카테고리 선택
            </h3>
            
            <button 
                onClick={handleSelectAll}
                className="text-btn"
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
             <div style={{ gridColumn: '1 / -1', color: 'var(--error-color)', textAlign: 'center', padding: '20px' }}>
                카테고리 데이터를 불러오지 못했습니다.
             </div>
          )}
        </div>

        <h3 style={{ marginTop: '30px' }}>
            <FaSortNumericDown style={{ marginRight: '8px' }} /> 
            문제 수 설정: <span style={{ color: 'var(--primary-color)' }}>{limit}</span>문제
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
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
            <span>5</span>
            <span>50</span>
        </div>
      </div>

      <button className="start-btn-large" onClick={handleStart}>
        <FaRocket style={{ marginRight: '8px' }} /> 퀴즈 시작하기
      </button>
    </div>
  );
};