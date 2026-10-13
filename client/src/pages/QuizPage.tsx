import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ProgressBar, QuizCard, ResultScreen } from '../components';
import { useQuiz } from '../hooks/useQuiz';
import { useTrack } from '../hooks/useTrack';
import { useAuth } from '../auth/AuthContext';
import { recordApi } from '../api/recordApi';
import { wrongAnswerApi } from '../api/wrongAnswerApi';
import { STORAGE_KEYS } from '../constants';

export default function QuizPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { track, loading: trackLoading, error: trackError } = useTrack(slug);
  const savedRecordRef = useRef(false);

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

  useEffect(() => {
    savedRecordRef.current = false;
  }, [slug, categoryIds.join(',')]);

  useEffect(() => {
    if (!state.isFinished || state.isReviewMode || !track || !isLoggedIn) return;
    if (savedRecordRef.current) return;
    savedRecordRef.current = true;

    const persist = async () => {
      try {
        await recordApi.create({
          trackId: track.trackId,
          score: state.score,
          totalQuestions: state.questions.length,
        });
      } catch (err) {
        console.warn('failed to save quiz record', err);
      }

      try {
        const key = `${STORAGE_KEYS.WRONG_ANSWER}:${track.slug}`;
        const local = JSON.parse(localStorage.getItem(key) || '[]') as number[];
        if (local.length > 0) {
          const merged = await wrongAnswerApi.merge(track.trackId, local);
          localStorage.setItem(
            key,
            JSON.stringify(merged.map((row) => row.questionId))
          );
        }
      } catch (err) {
        console.warn('failed to sync wrong answers', err);
      }
    };

    persist();
  }, [
    state.isFinished,
    state.isReviewMode,
    state.score,
    state.questions.length,
    track,
    isLoggedIn,
  ]);

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
        onClearWrong={async () => {
          actions.clearWrongAnswers();
          if (isLoggedIn && track) {
            try {
              await wrongAnswerApi.clearTrack(track.trackId);
            } catch (err) {
              console.warn('failed to clear server wrong answers', err);
            }
          }
        }}
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
