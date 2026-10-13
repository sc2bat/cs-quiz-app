import { useState, useEffect, useCallback } from 'react';
import type { Question, Track } from '../types';
import { STORAGE_KEYS } from '../constants';
import { quizApi } from '../api/quizApi';

export const useQuiz = (track: Track | null) => {
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

  useEffect(() => {
    if (!track) {
      setQuestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        const categories = await quizApi.fetchCategories(track.slug);
        const categoryIds = categories.map((c) => c.categoryId);
        if (categoryIds.length === 0) {
          setQuestions([]);
          setError('이 트랙에 등록된 카테고리가 없습니다.');
          return;
        }
        const data = await quizApi.fetchQuizzes(categoryIds, {
          trackSlug: track.slug,
          quizLimit: track.defaults?.questionLimit,
        });
        setQuestions(data.data);
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setIsCorrect(null);
        setSubjectiveInput('');
        setIsReviewMode(false);
        setTimeLeft(track.defaults?.secondsPerQuestion ?? 30);
      } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : '문제 로딩 실패';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [track]);

  const saveWrongAnswer = useCallback((qId: number) => {
    const stored = JSON.parse(localStorage.getItem(wrongStorageKey) || '[]');
    if (!stored.includes(qId)) {
      const newWrongAnswers = [...stored, qId];
      localStorage.setItem(wrongStorageKey, JSON.stringify(newWrongAnswers));
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
    if (!track || selectedAnswer !== null || isFinished || questions.length === 0) return;

    if (timeLeft === 0) {
      handleTimeOver();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [track, timeLeft, selectedAnswer, isFinished, questions, handleTimeOver]);

  const handleChoiceClick = (choiceId: number, isAnsCorrect: boolean) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choiceId);
    setShowExplanation(true);
    setIsCorrect(isAnsCorrect);

    if (isAnsCorrect) {
      setScore((prev) => prev + 1);
    } else {
      if (!isReviewMode) saveWrongAnswer(questions[currentIndex].questionId);
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
    } else {
      if (!isReviewMode) saveWrongAnswer(questions[currentIndex].questionId);
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

  const handleRetryAll = () => {
    window.location.reload();
  };

  const handleReviewWrongAnswers = () => {
    const stored = JSON.parse(localStorage.getItem(wrongStorageKey) || '[]');
    if (stored.length === 0) {
      alert('저장된 오답이 없습니다');
      return;
    }
    const wrongQuestions = questions.filter(q => stored.includes(q.questionId));
    if (wrongQuestions.length === 0) {
      alert('이번 세션에 포함된 오답이 없습니다');
      return;
    }
    setQuestions(wrongQuestions);
    setIsReviewMode(true);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsCorrect(null);
    setSubjectiveInput('');
    setTimeLeft(secondsPerQuestion);
  };

  const clearWrongAnswers = () => {
    localStorage.removeItem(wrongStorageKey);
    alert('오답 노트 초기화 완료');
  };

  const handleChangeTrack = () => {
    window.location.reload();
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
      handleChangeTrack,
    }
  };
};
