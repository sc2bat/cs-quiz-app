interface ResultScreenProps {
    score: number;
    total: number;
    isReviewMode: boolean;
    onRetryAll: () => void;
    onRetryWrong: () => void;
    onClearWrong: () => void;
}

const ResultScreen = ({ score, total, isReviewMode, onRetryAll, onRetryWrong, onClearWrong }: ResultScreenProps) => {
    return (
        <div className="result-container">
            <h1>{isReviewMode ? '오답 복습 완료' : '퀴즈 종료'}</h1>
            <p>당신의 점수: {score} / {total}</p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button onClick={onRetryAll} style={{ padding: '15px 30px' }}>
                    처음부터 다시 하기
                </button>
                {!isReviewMode && (
                    <button onClick={onRetryWrong} style={{ padding: '15px 30px', backgroundColor: '#ff9800' }}>틀린 문제 다시 풀기</button>
                )}
            </div>
            {isReviewMode && (
                <div style={{ marginTop: '20px' }}>
                    <button onClick={onClearWrong} style={{ padding: '10px', backgroundColor: '#f44336', fontSize: '0.9rem' }}>
                        틀린 문제 초기화
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultScreen;