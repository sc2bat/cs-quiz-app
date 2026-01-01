import type { Question } from "../types";

interface QuizCardProps {
    question: Question;
    selectedAnswer: number | null;
    isCorrect: boolean | null;
    showExplanation: boolean;
    timeLeft: number;
    subjectiveInput: string;
    onChoiceClick: (id: number, isCorrect: boolean) => void;
    onSubjectiveChange: (val: string) => void;
    onSubjectiveSubmit: () => void;
    onNext: () => void;
}

const QuizCard = ({
    question,
    selectedAnswer,
    isCorrect,
    showExplanation,
    timeLeft,
    subjectiveInput,
    onChoiceClick,
    onSubjectiveChange,
    onSubjectiveSubmit,
    onNext
}: QuizCardProps) => {
    return (

        <div className="card">
            <span className="badge">{question.categoryName}</span>
            <h2>Q. {question.question}</h2>

            <div className="choices-list">
                {/* A. 객관식 경우 */}
                {question.type === 'MULTIPLE' && question.choices.map((choice) => {

                    let btnClass = 'answer-btn';
                    if (selectedAnswer !== null) {
                        if (choice.isCorrect) btnClass += ' correct';
                        if (choice.choiceId === selectedAnswer && !choice.isCorrect) btnClass += ' wrong';
                    }

                    return (
                        <button
                            key={choice.choiceId}
                            className={btnClass}
                            onClick={() => onChoiceClick(choice.choiceId, choice.isCorrect)}
                            disabled={selectedAnswer !== null}
                        >
                            {choice.choiceText}
                        </button>
                    );
                })}

                {/* B. 주관식 경우 */}
                {question.type === 'SUBJECTIVE' && (
                    <div className="subjective-box">
                        <input
                            type="text"
                            className="subjective-input"
                            placeholder="정답을 입력하세요 (예: 443)"
                            value={subjectiveInput}
                            onChange={(e) => onSubjectiveChange(e.target.value)}
                            disabled={selectedAnswer !== null}
                        />
                        <button
                            className="submit-btn"
                            onClick={onSubjectiveSubmit}
                            disabled={selectedAnswer !== null || subjectiveInput.trim() === ''}
                        >
                            제출하기
                        </button>

                        {/* 내가 쓴 답이 틀렸을 때 정답 알려주기 */}
                        {selectedAnswer !== null && !isCorrect && (
                            <div style={{ marginTop: '10px', color: 'red' }}>
                                <strong>정답: {question.subjectiveAnswer}</strong>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 정답 확인 및 해설 (선택했을 때만 보임) */}
            {showExplanation && (
                <div className="feedback-section">
                    <h3 style={{ color: isCorrect ? 'green' : 'red' }}>
                        {timeLeft === 0 && selectedAnswer === 999 ? '시간 초과' : (isCorrect ? '⭕ 정답입니다!' : '❌ 틀렸습니다!')}
                    </h3>
                    <div className="explanation-box">
                        <strong>[해설]</strong> {question.explanation}
                    </div>
                    <button className="next-btn" onClick={onNext}>
                        다음 문제 ➡
                    </button>
                </div>
            )}
        </div>
    );
}

export default QuizCard;
