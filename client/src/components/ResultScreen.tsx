interface ResultScreenProps {
    score: number;
    total: number;
    isReviewMode: boolean;
    onRetryAll: () => void;
    onRetryWrong: () => void;
    onClearWrong: () => void;
    onChangeCategories?: () => void;
    onChangeTrack?: () => void;
}

const ResultScreen = ({
    score,
    total,
    isReviewMode,
    onRetryAll,
    onRetryWrong,
    onClearWrong,
    onChangeCategories,
    onChangeTrack,
}: ResultScreenProps) => {
    return (
        <div className="result-container">
            <h1>{isReviewMode ? '오답 복습 완료' : '퀴즈 종료'}</h1>
            <p>당신의 점수: {score} / {total}</p>

            <div className="result-actions">
                <button type="button" className="next-btn" onClick={onRetryAll}>
                    같은 설정으로 다시 풀기
                </button>
                {!isReviewMode && (
                    <button
                        type="button"
                        className="next-btn result-actions__wrong"
                        onClick={onRetryWrong}
                    >
                        틀린 문제 다시 풀기
                    </button>
                )}
            </div>

            <div className="result-nav">
                {onChangeCategories && (
                    <button type="button" className="ghost-btn" onClick={onChangeCategories}>
                        카테고리 변경
                    </button>
                )}
                {onChangeTrack && (
                    <button type="button" className="ghost-btn" onClick={onChangeTrack}>
                        트랙 변경
                    </button>
                )}
            </div>

            {isReviewMode && (
                <div className="result-nav">
                    <button type="button" className="danger-btn" onClick={onClearWrong}>
                        틀린 문제 초기화
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultScreen;
