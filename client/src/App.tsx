import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import QuizPage from './pages/QuizPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import LoginFailedPage from './pages/LoginFailedPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tracks/:slug" element={<CategoryPage />} />
      <Route path="/tracks/:slug/quiz" element={<QuizPage />} />
      <Route path="/login/success" element={<LoginSuccessPage />} />
      <Route path="/login/failed" element={<LoginFailedPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
