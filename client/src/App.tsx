import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// 타입 정의 (그대로 유지)
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
  choices: Choice[];
}

interface ApiResponse {
  status: string;
  data: Question[];
}

function App() {
  // 1. 상태 관리 (State)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 몇 번째 문제인가?
  const [score, setScore] = useState(0); // 맞은 개수
  const [isFinished, setIsFinished] = useState(false); // 퀴즈 종료 여부
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); // 사용자가 고른 답 ID
  const [showExplanation, setShowExplanation] = useState(false); // 해설 보여주기 여부
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // 정답 여부 (O/X)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // 2. 데이터 불러오기
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get<ApiResponse>(`${API_URL}/api/quizzes`);
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

  // 3. 정답 처리 함수
  const handleAnswerClick = (choiceId: number, isAnsCorrect: boolean) => {
    if (selectedAnswer !== null) return; // 이미 선택했으면 클릭 방지

    setSelectedAnswer(choiceId);
    setShowExplanation(true); // 해설 보여주기
    setIsCorrect(isAnsCorrect);

    if (isAnsCorrect) {
      setScore((prev) => prev + 1); // 점수 증가
    }
  };

  // 4. 다음 문제로 넘어가기
  const handleNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      // 상태 초기화
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsCorrect(null);
    } else {
      setIsFinished(true); // 끝남
    }
  };

  // 5. 다시 풀기 (Reset)
  const handleRetry = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    window.location.reload(); // 데이터를 다시 섞으려면 새로고침이 제일 확실함
  };

  // -- 렌더링 부분 --

  if (loading) return <div className="loading">⏳ 문제 로딩 중...</div>;
  if (error) return <div className="error">❌ {error}</div>;
  if (questions.length === 0) return <div>등록된 문제가 없습니다.</div>;

  // [결과 화면]
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

  // [퀴즈 풀기 화면]
  const currentQuestion = questions[currentIndex];

  return (
    <div className="quiz-container">
      <div className="progress-bar">
        문제 {currentIndex + 1} / {questions.length}
      </div>

      <div className="card">
        <span className="badge">{currentQuestion.category}</span>
        <h2>Q. {currentQuestion.question}</h2>

        <div className="choices-list">
          {/* 객관식 보기 */}
          {currentQuestion.choices.map((choice) => {
            // 정답/오답에 따른 버튼 색상 결정 로직
            let btnClass = 'answer-btn';
            if (selectedAnswer !== null) {
              if (choice.isCorrect) btnClass += ' correct'; // 정답인 버튼은 초록색
              if (choice.id === selectedAnswer && !choice.isCorrect) btnClass += ' wrong'; // 내가 고른 오답은 빨간색
            }

            return (
              <button
                key={choice.id}
                className={btnClass}
                onClick={() => handleAnswerClick(choice.id, choice.isCorrect)}
                disabled={selectedAnswer !== null} // 선택 후엔 클릭 불가
              >
                {choice.text}
              </button>
            );
          })}
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