import { FaTrophy, FaRedoAlt, FaClipboardList, FaTrashAlt, FaHome } from 'react-icons/fa';

interface ResultScreenProps {
  score: number;
  total: number;
  isReviewMode: boolean;
  onRetryAll: () => void;
  onRetryWrong: () => void;
  onClearWrong: () => void;
  onGoHome: () => void;
}

const ResultScreen = ({
  score,
  total,
  isReviewMode,
  onRetryAll,
  onRetryWrong,
  onClearWrong,
  onGoHome
}: ResultScreenProps) => {
  return (
    <div className="result-container card">
      <h2>
        <FaTrophy style={{ color: '#FFD700', marginRight: '8px' }} /> 
        퀴즈 종료!
      </h2>
      
      <div className="score-board">
        <p>당신의 점수는?</p>
        <div className="score-text">
          {score} / {total}
        </div>
      </div>

      <div className="result-actions">
        {/* 다시 풀기 */}
        <button onClick={onRetryAll} className="retry-btn">
          <FaRedoAlt style={{ marginRight: '6px' }} /> 전체 다시 풀기
        </button>
        
        {!isReviewMode && score < total && (
          // 오답 노트
          <button onClick={onRetryWrong} className="review-btn">
            <FaClipboardList style={{ marginRight: '6px' }} /> 오답만 다시 풀기
          </button>
        )}

        {/* 삭제 */}
        <button onClick={onClearWrong} className="clear-btn">
          <FaTrashAlt style={{ marginRight: '6px' }} /> 오답 기록 삭제
        </button>

        {/* 홈으로 */}
        <button 
            onClick={onGoHome} 
            className="home-btn" 
            style={{ marginTop: '10px', backgroundColor: '#6c757d' }}
        >
          <FaHome style={{ marginRight: '6px' }} /> 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;