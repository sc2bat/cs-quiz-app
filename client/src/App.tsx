import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';


interface Choice {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  category: string;
  type: string;
  question: string;
  explanation: string;
  subjectiveAnswer?: string;
  choices: Choice[];
}

interface ApiResponse {
  status: string;
  data: Question[];
}

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjectiveInput, setSubjectiveInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [score, setScore] = useState(0); 
  const [isFinished, setIsFinished] = useState(false); 

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); 
  const [showExplanation, setShowExplanation] = useState(false); 
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null); 

  
  const [timeLeft, setTimeLeft] = useState(30);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http:/ /localhost:3000';

  
  useEffect(() => {
    const fetchQuizzes = async () => {
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

  const handleTimeOver = () => {
    setSelectedAnswer(999); 
    setShowExplanation(true);
    setIsCorrect(false); 
  }

  
  
  const handleChoiceClick = (choiceId: number, isAnsCorrect: boolean) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choiceId); 
    setShowExplanation(true);
    setIsCorrect(isAnsCorrect);
    if (isAnsCorrect) setScore((prev) => prev + 1);
  };
  
  const handleSubjectiveSubmit = () => {
    if (selectedAnswer !== null) return; 

    
    const correctAnswer = currentQuestion.subjectiveAnswer || '';
    const isAnsCorrect = subjectiveInput.trim() === correctAnswer.trim();

    setSelectedAnswer(999); 
    setShowExplanation(true);
    setIsCorrect(isAnsCorrect);

    if (isAnsCorrect) setScore((prev) => prev + 1);
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

  
  const handleRetry = () => {
    
    
    
    
    
    window.location.reload();
  };

  

  if (loading) return <div className="loading">⏳ 문제 로딩 중...</div>;
  if (error) return <div className="error">❌ {error}</div>;
  if (questions.length === 0) return <div>등록된 문제가 없습니다.</div>;

  
  if (isFinished) {
    return (
      <div className="result-container">
        <h1>🎉 퀴즈 종료!</h1>
        <p>당신의 점수는?</p>
        <h2 style={{ fontSize: '3rem', margin: '20px 0' }}>
          {score} / {questions.length}
        </h2>
        <button onClick={handleRetry} style={{ padding: '15px 30px', fontSize: '1.2rem' }}>
          다시 도전하기
        </button>
      </div>
    );
  }

  
  const currentQuestion = questions[currentIndex];

  return (
    <div className="quiz-container">
      {/* 타이머 UI */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div className="progress-bar">문제 {currentIndex + 1} / {questions.length}</div>
        <div style={{ 
          color: timeLeft <= 5 ? 'red' : 'black', 
          fontWeight: 'bold', 
          fontSize: '1.2rem' 
        }}>
          ⏰ 남은 시간: {timeLeft}초
        </div>
      </div>

      <div className="card">
        <span className="badge">{currentQuestion.category}</span>
        <h2>Q. {currentQuestion.question}</h2>

        <div className="choices-list">
          {/* A. 객관식 경우 */}
          {currentQuestion.type === 'MULTIPLE' && currentQuestion.choices.map((choice) => {
            
            let btnClass = 'answer-btn';
            if (selectedAnswer !== null) {
              if (choice.isCorrect) btnClass += ' correct'; 
              if (choice.id === selectedAnswer && !choice.isCorrect) btnClass += ' wrong'; 
            }

            return (
              <button
                key={choice.id}
                className={btnClass}
                onClick={() => handleChoiceClick(choice.id, choice.isCorrect)}
                disabled={selectedAnswer !== null} 
              >
                {choice.text}
              </button>
            );
          })}

          {/* B. 주관식 경우 */}
          {currentQuestion.type === 'SUBJECTIVE' && (
            <div className="subjective-box">
              <input
                type="text"
                className="subjective-input"
                placeholder="정답을 입력하세요 (예: 443)"
                value={subjectiveInput}
                onChange={(e) => setSubjectiveInput(e.target.value)}
                disabled={selectedAnswer !== null} 
              />
              <button
                className="submit-btn"
                onClick={handleSubjectiveSubmit}
                disabled={selectedAnswer !== null || subjectiveInput.trim() === ''}
              >
                제출하기
              </button>

              {/* 내가 쓴 답이 틀렸을 때 정답 알려주기 */}
              {selectedAnswer !== null && !isCorrect && (
                <div style={{ marginTop: '10px', color: 'red' }}>
                  <strong>정답: {currentQuestion.subjectiveAnswer}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 정답 확인 및 해설 (선택했을 때만 보임) */}
        {showExplanation && (
          <div className="feedback-section">
            <h3 style={{ color: isCorrect ? 'green' : 'red' }}>
              {isCorrect ? '⭕ 정답입니다!' : '❌ 틀렸습니다!'}
            </h3>
            <div className="explanation-box">
              <strong>[해설]</strong> {currentQuestion.explanation}
            </div>
            <button className="next-btn" onClick={handleNextQuestion}>
              다음 문제 ➡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;