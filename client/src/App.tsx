import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tracks/:slug" element={<CategoryPage />} />
      <Route path="/tracks/:slug/quiz" element={<QuizPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
