import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

import type { Question, ApiResponse } from './types';
import { ProgressBar, ResultScreen, QuizCard } from './components';
import { STORAGE_KEYS } from './constants';

function App() {
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

  useEffect(() => {
    const fetchQuizzes = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      try {
        const response = await axios.get<ApiResponse>(`${API_BASE_URL}/api/quizzes`);
        setQuestions(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('문제 로딩 실패!');
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

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
  }, [timeLeft, selectedAnswer, isFinished, questions]);

  const saveWrongAnswer = (qId: number) => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG_ANSWER) || '[]');
    if (!stored.includes(qId)) {
      const newWrongAnswers = [...stored, qId];
      localStorage.setItem(STORAGE_KEYS.WRONG_ANSWER, JSON.stringify(newWrongAnswers));
    }
  }

  const handleTimeOver = () => {
    setSelectedAnswer(999);
    setShowExplanation(true);
    setIsCorrect(false);
    if (!isReviewMode) saveWrongAnswer(questions[currentIndex].id);
  }

  const handleChoiceClick = (choiceId: number, isAnsCorrect: boolean) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choiceId);
    setShowExplanation(true);
    setIsCorrect(isAnsCorrect);
    if (isAnsCorrect) {
      setScore((prev) => prev + 1);
    } else {
      if (!isReviewMode) saveWrongAnswer(questions[currentIndex].id);
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
      if (!isReviewMode) saveWrongAnswer(questions[currentIndex].id);
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

  const handleReivewWrongAnswers = () => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG_ANSWER) || '[]');

    if (stored.length === 0) {
      alert('저장된 오답이 없습니다.');
      return;
    }

    const wrongQuestions = questions.filter(q => stored.includes(q.id));
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
  }

  const clearWrongAnswers = () => {
    localStorage.removeItem(STORAGE_KEYS.WRONG_ANSWER);
    alert('오답 노트 초기화 완료');
  }

  if (loading) return <div className="loading">⏳ 문제 로딩 중...</div>;
  if (error) return <div className="error">❌ {error}</div>;
  if (questions.length === 0) return <div>등록된 문제가 없습니다.</div>;

  if (isFinished) {
    return (
      <ResultScreen
        score={score}
        total={questions.length}
        isReviewMode={isReviewMode}
        onRetryAll={handleRetryAll}
        onRetryWrong={handleReivewWrongAnswers}
        onClearWrong={clearWrongAnswers}
      />
    );
  }

  return (
    <div className='quiz-container'>
      {isReviewMode && <div className='badge' style={{ marginBottom: '10px', backgroundColor: '#ff9800' }}>
        오답 복습 모드
      </div>}

      <ProgressBar
        current={currentIndex + 1}
        total={questions.length}
        timeLeft={timeLeft}
      />

      <QuizCard
        question={questions[currentIndex]}
        selectedAnswer={selectedAnswer}
        isCorrect={isCorrect}
        showExplanation={showExplanation}
        timeLeft={timeLeft}
        subjectiveInput={subjectiveInput}
        onChoiceClick={handleChoiceClick}
        onSubjectiveChange={setSubjectiveInput}
        onSubjectiveSubmit={handleSubjectiveSubmit}
        onNext={handleNextQuestion}
      />
    </div>
  );
}

export default App;