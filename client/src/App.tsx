import { useEffect, useState } from 'react';
import './App.css';
import { ProgressBar, ResultScreen, QuizCard, TrackSelect } from './components';
import { useQuiz } from './hooks/useQuiz';
import { trackApi } from './api/trackApi';
import type { Track } from './types';

function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const { state, actions } = useQuiz(selectedTrack);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setTracksLoading(true);
        const data = await trackApi.fetchTracks();
        setTracks(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '트랙 로딩 실패';
        setTracksError(message);
      } finally {
        setTracksLoading(false);
      }
    };
    loadTracks();
  }, []);

  if (!selectedTrack) {
    return (
      <TrackSelect
        tracks={tracks}
        loading={tracksLoading}
        error={tracksError}
        onSelect={setSelectedTrack}
      />
    );
  }

  if (state.loading) return <div className="loading">문제 로딩 중...</div>;
  if (state.error) {
    return (
      <div className="error-panel">
        <div className="error">{state.error}</div>
        <button type="button" className="next-btn" onClick={actions.handleChangeTrack}>
          트랙 다시 선택
        </button>
      </div>
    );
  }
  if (state.questions.length === 0) {
    return (
      <div className="error-panel">
        <div>등록된 문제가 없습니다.</div>
        <button type="button" className="next-btn" onClick={actions.handleChangeTrack}>
          트랙 다시 선택
        </button>
      </div>
    );
  }

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
    <div className="quiz-container">
      <div className="quiz-header">
        <span className="badge">{selectedTrack.name}</span>
        <button type="button" className="link-btn" onClick={actions.handleChangeTrack}>
          트랙 변경
        </button>
      </div>

      {state.isReviewMode && (
        <div className="badge" style={{ marginBottom: '10px', backgroundColor: '#ff9800' }}>
          오답 복습 모드
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
  );
}

export default App;
