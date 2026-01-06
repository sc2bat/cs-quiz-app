import { useState, useEffect, useCallback } from 'react';
import type { Question, QuizConfig } from '../types';
import { STORAGE_KEYS } from '../constants';
import { quizApi } from '../api/quizApi';
import logger from '../utils/logger';

export const useQuiz = (quizConfig: QuizConfig | null) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [subjectiveInput, setSubjectiveInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  const [isReviewMode, setIsReviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // data fetching
  useEffect(() => {
    if (!quizConfig) {
      setQuestions([]);
      setLoading(false);
      return;
    }const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsFinished(false);
        setCurrentIndex(0);
        setScore(0);

        logger.debug('[useQuiz] Fetching questions with config:', quizConfig);
        
        const data = await quizApi.fetchQuizzes(quizConfig.categoryIds, quizConfig.limit);
        
        if (!data || data.length === 0) {
          throw new Error('조건에 맞는 문제가 없습니다.');
        }

        setQuestions(data);
      } catch (err: any) {
        logger.error('[useQuiz] Error:', err);
        setError(err.message || '문제 로딩 실패');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [quizConfig]);

  const saveWrongAnswer = useCallback((qId: number) => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG_ANSWER) || '[]');
    if (!stored.includes(qId)) {
      const newWrongAnswers = [...stored, qId];
      localStorage.setItem(STORAGE_KEYS.WRONG_ANSWER, JSON.stringify(newWrongAnswers));
    }
  }, []);

  const handleTimeOver = useCallback(() => {
    setSelectedAnswer(999);
    setShowExplanation(true);
    setIsCorrect(false);
    if (!isReviewMode && questions[currentIndex]) {
        saveWrongAnswer(questions[currentIndex].questionId);
    }
  }, [currentIndex, isReviewMode, questions, saveWrongAnswer]);

  // 타이머 로직
  useEffect(() => {
    if (selectedAnswer !== null || isFinished || questions.length === 0) return;

    if (timeLeft === 0) {
      handleTimeOver();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, selectedAnswer, isFinished, questions, handleTimeOver]);

  // 이벤트 핸들러
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
      setTimeLeft(30);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetryAll = () => {
    window.location.reload();
  };

  const handleReviewWrongAnswers = () => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG_ANSWER) || '[]');
    if (stored.length === 0) {
      alert('저장된 오답이 없습니다');
      return;
    }
    const wrongQuestions = questions.filter(q => stored.includes(q.questionId));
    setQuestions(wrongQuestions);
    setIsReviewMode(true);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsCorrect(null);
    setSubjectiveInput('');
    setTimeLeft(30);
  };

  const clearWrongAnswers = () => {
    localStorage.removeItem(STORAGE_KEYS.WRONG_ANSWER);
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
      clearWrongAnswers
    }
  };
};
