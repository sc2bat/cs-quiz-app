import { useState } from 'react';
import './App.css';
import { ProgressBar, ResultScreen, QuizCard } from './components';
import { useQuiz } from './hooks/useQuiz';
import type { AppMode, QuizConfig } from './types';
import { Header } from './components/Header';
import { SetupScreen } from './components/SetupScreen';
import { useCategory } from './hooks/useCategory';
import { FaSpinner, FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('SETUP');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const { state, actions } = useQuiz(quizConfig);
  const { categories, loading: loadingCats, error: catError } = useCategory();

  const handleStartQuiz = (config: QuizConfig) => {
    setQuizConfig(config);
    setAppMode('PLAYING');
  };

  const handleLogin = (provider: 'github' | 'google') => {
    console.log(`${provider} 로그인 시도...`);
    setIsLoggedIn(true);
  };

  const handleQuitQuiz = () => {
    if (confirm("정말 퀴즈를 중단하고 홈으로 돌아가시겠습니까?")) {
      setAppMode('SETUP');
      setQuizConfig(null);
    }
  };

  return (
    <>
      <Header
        appMode={appMode}
        onOpenSettings={() => setAppMode('SETUP')}
        onQuitQuiz={handleQuitQuiz}
        isLoggedIn={isLoggedIn}
      />

      <div className='container'>

        {/* [모드 1] 설정 화면 */}
        {appMode === 'SETUP' && (
          loadingCats ? (
            <div className="loading">
              <FaSpinner className="icon-spin" style={{ marginRight: '8px' }} />
              카테고리 불러오는 중...
            </div>
          ) : catError ? (
            <div className="error">
              <FaExclamationCircle style={{ marginRight: '8px' }} />
              {catError}
            </div>
          ) : (
            <SetupScreen
              categories={categories}
              onStart={handleStartQuiz}
              onLogin={handleLogin}
              isLoggedIn={isLoggedIn}
            />
          )
        )}

        {/* [모드 2] 게임 진행 화면 */}
        {appMode === 'PLAYING' && (
          <>
            {/* 1. 로딩/에러/빈값 처리 (Wrapper 없이 전체 화면 사용) */}
            {state.loading ? (
              <div className="loading">
                <FaSpinner className="icon-spin" style={{ marginRight: '8px' }} />
                문제 생성 중...
              </div>
            ) : state.error ? (
              <div className="error">
                <FaExclamationCircle style={{ marginRight: '8px' }} />
                {state.error}
              </div>
            ) : state.questions.length === 0 ? (
              <div className="error">
                <FaExclamationCircle style={{ marginRight: '8px' }} />
                등록된 문제가 없습니다.
              </div>
            ) : state.isFinished ? (
              <ResultScreen
                score={state.score}
                total={state.questions.length}
                isReviewMode={state.isReviewMode}
                onRetryAll={actions.handleRetryAll}
                onRetryWrong={actions.handleReviewWrongAnswers}
                onClearWrong={actions.clearWrongAnswers}
                onGoHome={() => setAppMode('SETUP')}
              />
            ) : (
              <div className='quiz-container' style={{ width: '100%' }}>
                
                {state.isReviewMode && (
                  <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                    <span className='badge warning'>
                      <FaExclamationTriangle style={{ marginRight: '4px' }} /> 오답 복습 모드
                    </span>
                  </div>
                )}

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
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;