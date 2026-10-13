import { useState, useEffect, useCallback } from 'react';
import type { Question, Track } from '../types';
import { STORAGE_KEYS } from '../constants';
import { quizApi } from '../api/quizApi';

interface UseQuizOptions {
  track: Track | null;
  categoryIds: number[];
  enabled: boolean;
}

export const useQuiz = ({ track, categoryIds, enabled }: UseQuizOptions) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [subjectiveInput, setSubjectiveInput] = useState('');
  const secondsPerQuestion = track?.defaults?.secondsPerQuestion ?? 30;
  const [timeLeft, setTimeLeft] = useState(secondsPerQuestion);

  const [isReviewMode, setIsReviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrongStorageKey = track
    ? `${STORAGE_KEYS.WRONG_ANSWER}:${track.slug}`
    : STORAGE_KEYS.WRONG_ANSWER;

  const resetSessionUi = useCallback((seconds: number) => {
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsCorrect(null);
    setSubjectiveInput('');
    setTimeLeft(seconds);
  }, []);

  const categoryKey = categoryIds.join(',');

  useEffect(() => {
    if (!enabled || !track || categoryIds.length === 0) {
      return;
    }

    let cancelled = false;
    const ids = categoryKey.split(',').map(Number);

    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await quizApi.fetchQuizzes(ids, {
          trackSlug: track.slug,
          quizLimit: track.defaults?.questionLimit,
        });
        if (cancelled) return;
        setQuestions(data.data);
        setIsReviewMode(false);
        resetSessionUi(track.defaults?.secondsPerQuestion ?? 30);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error(err);
        const message = err instanceof Error ? err.message : '문제 로딩 실패';
        setError(message);
        setQuestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchQuizzes();
    return () => {
      cancelled = true;
    };
  }, [enabled, track, categoryKey, categoryIds.length, resetSessionUi]);

  const saveWrongAnswer = useCallback((qId: number) => {
    const stored = JSON.parse(localStorage.getItem(wrongStorageKey) || '[]') as number[];
    if (!stored.includes(qId)) {
      localStorage.setItem(wrongStorageKey, JSON.stringify([...stored, qId]));
    }
  }, [wrongStorageKey]);

  const handleTimeOver = useCallback(() => {
    setSelectedAnswer(999);
    setShowExplanation(true);
    setIsCorrect(false);
    if (!isReviewMode && questions[currentIndex]) {
      saveWrongAnswer(questions[currentIndex].questionId);
    }
  }, [currentIndex, isReviewMode, questions, saveWrongAnswer]);

  useEffect(() => {
    if (!enabled || selectedAnswer !== null || isFinished || questions.length === 0) return;

    if (timeLeft === 0) {
      handleTimeOver();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [enabled, timeLeft, selectedAnswer, isFinished, questions, handleTimeOver]);

  const handleChoiceClick = (choiceId: number, isAnsCorrect: boolean) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choiceId);
    setShowExplanation(true);
    setIsCorrect(isAnsCorrect);

    if (isAnsCorrect) {
      setScore((prev) => prev + 1);
    } else if (!isReviewMode) {
      saveWrongAnswer(questions[currentIndex].questionId);
    }
  };

  const handleSubjectiveSubmit = () => {
    if (selectedAnswer !== null) return;
    const correctAnswer = questions[currentIndex].subjectiveAnswer || '';
    const isAnsCorrect = subjectiveInput.trim() === correctAnswer.trim();

    setSelectedAnswer(999);
    setShowExplanation(true);
    setIsCorrect(isAnsCorrect);

    if (isAnsCorrect) {
      setScore((prev) => prev + 1);
    } else if (!isReviewMode) {
      saveWrongAnswer(questions[currentIndex].questionId);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsCorrect(null);
      setSubjectiveInput('');
      setTimeLeft(secondsPerQuestion);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetryAll = async () => {
    if (!track || categoryIds.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const data = await quizApi.fetchQuizzes(categoryIds, {
        trackSlug: track.slug,
        quizLimit: track.defaults?.questionLimit,
      });
      setQuestions(data.data);
      setIsReviewMode(false);
      resetSessionUi(secondsPerQuestion);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '문제 로딩 실패';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewWrongAnswers = async () => {
    if (!track) return;
    const stored = JSON.parse(localStorage.getItem(wrongStorageKey) || '[]') as number[];
    if (stored.length === 0) {
      alert('저장된 오답이 없습니다');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await quizApi.fetchQuestionsByIds(stored, track.slug);
      if (!data.data.length) {
        alert('저장된 오답 문제를 찾을 수 없습니다');
        return;
      }
      setQuestions(data.data);
      setIsReviewMode(true);
      resetSessionUi(secondsPerQuestion);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오답 로딩 실패';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const clearWrongAnswers = () => {
    localStorage.removeItem(wrongStorageKey);
    alert('오답 노트 초기화 완료');
  };

  return {
    state: {
      questions, currentIndex, score, isFinished,
      selectedAnswer, showExplanation, isCorrect, subjectiveInput, timeLeft,
      isReviewMode, loading, error
    },
    actions: {
      setSubjectiveInput,
      handleChoiceClick,
      handleSubjectiveSubmit,
      handleNextQuestion,
      handleRetryAll,
      handleReviewWrongAnswers,
      clearWrongAnswers,
    }
  };
};
