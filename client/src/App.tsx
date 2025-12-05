import './App.css';
import { ProgressBar, ResultScreen, QuizCard } from './components';
import { useQuiz } from './hooks/useQuiz';

function App() {
  const {state, actions} = useQuiz();

  if (state.loading) return <div className="loading">⏳ 문제 로딩 중...</div>;
  if (state.error) return <div className="error">❌ {state.error}</div>;
  if (state.questions.length === 0) return <div>등록된 문제가 없습니다.</div>;

  if (state.isFinished) {
    return (
      <ResultScreen
        score={state.score}
        total={state.questions.length}
        isReviewMode={state.isReviewMode}
        onRetryAll={actions.handleRetryAll}
        onRetryWrong={actions.handleReviewWrongAnswers}
        onClearWrong={actions.clearWrongAnswers}
      />
    );
  }

  return (
    <div className='quiz-container'>
      {state.isReviewMode && <div className='badge' style={{ marginBottom: '10px', backgroundColor: '#ff9800' }}>
        오답 복습 모드
      </div>}

      <ProgressBar
        current={state.currentIndex + 1}
        total={state.questions.length}
        timeLeft={state.timeLeft}
      />

      <QuizCard
        question={state.questions[state.currentIndex]}
        selectedAnswer={state.selectedAnswer}
        isCorrect={state.isCorrect}
        showExplanation={state.showExplanation}
        timeLeft={state.timeLeft}
        subjectiveInput={state.subjectiveInput}
        onChoiceClick={actions.handleChoiceClick}
        onSubjectiveChange={actions.setSubjectiveInput}
        onSubjectiveSubmit={actions.handleSubjectiveSubmit}
        onNext={actions.handleNextQuestion}
      />
    </div>
  );
}

export default App;