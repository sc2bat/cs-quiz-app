import type { Category, Track } from '../types';

interface Props {
  track: Track;
  categories: Category[];
  selectedIds: number[];
  loading: boolean;
  error: string | null;
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onStart: () => void;
  onBack: () => void;
}

export default function CategorySelect({
  track,
  categories,
  selectedIds,
  loading,
  error,
  onToggle,
  onSelectAll,
  onClear,
  onStart,
  onBack,
}: Props) {
  if (loading) return <div className="loading">카테고리 불러오는 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="category-select">
      <button type="button" className="link-btn" onClick={onBack}>
        ← 트랙 목록
      </button>
      <h1 className="category-select__title">{track.name}</h1>
      <p className="category-select__subtitle">풀 카테고리를 선택한 뒤 시작하세요.</p>

      <div className="category-select__actions">
        <button type="button" className="ghost-btn" onClick={onSelectAll}>
          전체 선택
        </button>
        <button type="button" className="ghost-btn" onClick={onClear}>
          선택 해제
        </button>
      </div>

      {categories.length === 0 ? (
        <p>이 트랙에 카테고리가 없습니다.</p>
      ) : (
        <ul className="category-checklist">
          {categories.map((category) => {
            const checked = selectedIds.includes(category.categoryId);
            return (
              <li key={category.categoryId}>
                <label className={`category-check ${checked ? 'is-checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(category.categoryId)}
                  />
                  <span>{category.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        className="next-btn category-select__start"
        disabled={selectedIds.length === 0}
        onClick={onStart}
      >
        퀴즈 시작 ({selectedIds.length})
      </button>
    </div>
  );
}
