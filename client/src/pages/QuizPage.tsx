import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ProgressBar, QuizCard, ResultScreen } from '../components';
import { useQuiz } from '../hooks/useQuiz';
import { useTrack } from '../hooks/useTrack';

export default function QuizPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { track, loading: trackLoading, error: trackError } = useTrack(slug);

  const categoryIds = useMemo(
    () =>
      (searchParams.get('cats') || '')
        .split(',')
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id)),
    [searchParams]
  );

  const { state, actions } = useQuiz({
    track,
    categoryIds,
    enabled: Boolean(track) && categoryIds.length > 0,
  });

  if (trackLoading || state.loading) {
    return <div className="loading">문제 로딩 중...</div>;
  }

  if (trackError || !track) {
    return (
      <div className="error-panel">
        <div className="error">{trackError || '트랙을 찾을 수 없습니다.'}</div>
        <button type="button" className="next-btn" onClick={() => navigate('/')}>
          홈으로
        </button>
      </div>
    );
  }

  if (categoryIds.length === 0) {
    return (
      <div className="error-panel">
        <div className="error">카테고리를 먼저 선택하세요.</div>
        <button type="button" className="next-btn" onClick={() => navigate(`/tracks/${slug}`)}>
          카테고리 선택
        </button>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="error-panel">
        <div className="error">{state.error}</div>
        <button type="button" className="next-btn" onClick={() => navigate(`/tracks/${slug}`)}>
          카테고리로 돌아가기
        </button>
      </div>
    );
  }

  if (state.questions.length === 0) {
    return (
      <div className="error-panel">
        <div>등록된 문제가 없습니다.</div>
        <button type="button" className="next-btn" onClick={() => navigate(`/tracks/${slug}`)}>
          카테고리로 돌아가기
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
        onChangeCategories={() => navigate(`/tracks/${slug}`)}
        onChangeTrack={() => navigate('/')}
      />
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <span className="badge">{track.name}</span>
        <button type="button" className="link-btn" onClick={() => navigate(`/tracks/${slug}`)}>
          카테고리 변경
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
