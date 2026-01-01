import { useState, useRef, useEffect } from 'react';
import type { Category } from '../types';

interface Props {
    categories: Category[];
    selectedIds: number[];
    onToggle: (id: number) => void;
    disabled?: boolean;
}

export default function CategoryFilter({
    categories,
    selectedIds,
    onToggle,
    disabled = false
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* 1. 메인 버튼 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`inline-flex justify-between items-center w-full min-w-[200px] px-4 py-2 text-sm font-medium 
          border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
          }`}
      >
        <span>
            {selectedIds.length > 0 
                ? `${selectedIds.length}개 카테고리 선택됨` 
                : '카테고리 선택'}
        </span>
        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* 2. 드롭다운 메뉴 */}
      {isOpen && !disabled && (
        <div className="origin-top-left absolute left-0 mt-2 w-56 max-h-60 overflow-y-auto rounded-md shadow-lg 
                        bg-white ring-1 ring-black ring-opacity-5 z-50 
                        dark:bg-gray-800 dark:ring-gray-600 scrollbar-hide">
          <div className="py-1">
            {categories.map((category) => (
              <label 
                key={category.categoryId} 
                className="flex items-center px-4 py-2 text-sm cursor-pointer select-none
                           text-gray-700 hover:bg-gray-100 
                           dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  checked={selectedIds.includes(category.categoryId)}
                  onChange={() => onToggle(category.categoryId)}
                />
                {category.categoryName}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}