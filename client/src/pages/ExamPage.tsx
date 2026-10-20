import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTrack } from '../hooks/useTrack';
import { quizApi } from '../api/quizApi';
import type { Question } from '../types';

type ExamQuestion = Omit<Question, 'choices' | 'explanation' | 'subjectiveAnswer'> & {
  explanation?: string;
  subjectiveAnswer?: string;
  choices: { choiceId: number; choiceText: string; isCorrect?: boolean }[];
};

export default function ExamPage() {
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
  const categoryKey = categoryIds.join(',');

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<number, { choiceId?: number | null; subjectiveAnswer?: string }>
  >({});
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    details: {
      questionId: number;
      isCorrect: boolean;
      explanation: string | null;
    }[];
    byCategory: {
      categoryId: number;
      categoryName: string;
      correct: number;
      total: number;
      score: number;
    }[];
    average: number;
    overall: number;
    passed: boolean | null;
    passRule: {
      minPerCategory: number;
      minAverage?: number;
      minOverall?: number;
    } | null;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!track || categoryIds.length === 0) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await quizApi.fetchQuizzes(categoryIds, {
          trackSlug: track.slug,
          quizLimit: track.defaults?.questionLimit,
          mode: 'exam',
        });
        if (cancelled) return;
        setQuestions(data.data as ExamQuestion[]);
        const perQ = track.defaults?.secondsPerQuestion ?? 30;
        setTimeLeft(Math.max(60, data.data.length * perQ));
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Exam 로딩 실패');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [track, categoryKey]);

  const handleSubmit = useCallback(async () => {
    if (!track || submitting || finishedRef.current) return;
    finishedRef.current = true;
    setSubmitting(true);
    try {
      const currentAnswers = answersRef.current;
      const payload = questions.map((q) => ({
        questionId: q.questionId,
        choiceId: currentAnswers[q.questionId]?.choiceId ?? null,
        subjectiveAnswer: currentAnswers[q.questionId]?.subjectiveAnswer ?? null,
      }));
      const data = await quizApi.submitExam({
        trackId: track.trackId,
        answers: payload,
      });
      setResult({
        score: data.score,
        total: data.total,
        details: data.details,
        byCategory: data.byCategory ?? [],
        average: data.average ?? 0,
        overall: data.overall ?? 0,
        passed: data.passed ?? null,
        passRule: data.passRule ?? null,
      });
      setFinished(true);
    } catch (err: unknown) {
      finishedRef.current = false;
      setError(err instanceof Error ? err.message : '제출 실패');
    } finally {
      setSubmitting(false);
    }
  }, [track, submitting, questions]);

  useEffect(() => {
    if (finished || loading || questions.length === 0) return;
    if (timeLeft <= 0) {
      void handleSubmit();
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, finished, loading, questions.length, handleSubmit]);

  const current = questions[index];

  if (trackLoading || loading) return <div className="loading">Exam 준비 중...</div>;
  if (trackError || !track) {
    return (
      <div className="error-panel">
        <div className="error">{trackError || '트랙 없음'}</div>
        <button type="button" className="next-btn" onClick={() => navigate('/')}>홈</button>
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-panel">
        <div className="error">{error}</div>
        <button type="button" className="next-btn" onClick={() => navigate(`/tracks/${slug}`)}>
          뒤로
        </button>
      </div>
    );
  }

  if (finished && result) {
    return (
      <div className="result-container">
        <h1>Exam 결과</h1>
        <p>
          문항: {result.score} / {result.total}
        </p>
        {result.passed !== null && (
          <p>
            <strong style={{ color: result.passed ? 'green' : 'crimson' }}>
              {result.passed ? '합격' : '불합격'}
            </strong>
            {result.passRule && (
              <span>
                {' '}
                (과목당 {result.passRule.minPerCategory}점 이상
                {result.passRule.minAverage != null
                  ? `, 평균 ${result.passRule.minAverage}점 이상`
                  : ''}
                {result.passRule.minOverall != null
                  ? `, 총점 ${result.passRule.minOverall}점 이상`
                  : ''}
                )
              </span>
            )}
          </p>
        )}
        {result.byCategory.length > 0 && (
          <div className="exam-category-scores">
            <h2>과목별 점수</h2>
            <p>
              평균: {result.average}점 · 총점: {result.overall}점
            </p>
            <ul className="exam-review-list">
              {result.byCategory.map((c) => (
                <li key={c.categoryId} className="exam-review-item">
                  <strong>{c.categoryName}</strong>: {c.score}점 ({c.correct}/{c.total})
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className="exam-review-list">
          {questions.map((q) => {
            const detail = result.details.find((d) => d.questionId === q.questionId);
            return (
              <li key={q.questionId} className="exam-review-item">
                <strong style={{ color: detail?.isCorrect ? 'green' : 'crimson' }}>
                  {detail?.isCorrect ? 'O' : 'X'}
                </strong>{' '}
                {q.question}
                {detail?.explanation && (
                  <div className="explanation-box">{detail.explanation}</div>
                )}
              </li>
            );
          })}
        </ul>
        <button type="button" className="next-btn" onClick={() => navigate(`/tracks/${slug}`)}>
          카테고리로
        </button>
      </div>
    );
  }

  if (!current) return <div>문제가 없습니다.</div>;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <span className="badge">Exam · {track.name}</span>
        <span className="badge" style={{ backgroundColor: timeLeft < 30 ? '#f44336' : '#555' }}>
          남은 시간 {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </span>
      </div>
      <p>
        {index + 1} / {questions.length}
      </p>
      <h2>{current.question}</h2>

      {current.type === 'MULTIPLE' ? (
        <div>
          {current.choices.map((c) => (
            <button
              key={c.choiceId}
              type="button"
              className={`answer-btn ${
                answers[current.questionId]?.choiceId === c.choiceId ? 'correct' : ''
              }`}
              onClick={() =>
                setAnswers((prev) => ({
                  ...prev,
                  [current.questionId]: { choiceId: c.choiceId },
                }))
              }
            >
              {c.choiceText}
            </button>
          ))}
        </div>
      ) : (
        <div className="subjective-box">
          <input
            className="subjective-input"
            value={answers[current.questionId]?.subjectiveAnswer || ''}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [current.questionId]: { subjectiveAnswer: e.target.value },
              }))
            }
            placeholder="답을 입력하세요"
          />
        </div>
      )}

      <div className="result-actions">
        <button
          type="button"
          className="ghost-btn"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          이전
        </button>
        {index < questions.length - 1 ? (
          <button
            type="button"
            className="next-btn"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          >
            다음
          </button>
        ) : (
          <button
            type="button"
            className="next-btn"
            disabled={submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? '채점 중...' : '제출 · 서버 채점'}
          </button>
        )}
      </div>
    </div>
  );
}
