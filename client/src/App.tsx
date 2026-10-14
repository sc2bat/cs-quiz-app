import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import QuizPage from './pages/QuizPage';
import ExamPage from './pages/ExamPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import LoginFailedPage from './pages/LoginFailedPage';
import HistoryPage from './pages/HistoryPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminTracksPage from './pages/admin/AdminTracksPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tracks/:slug" element={<CategoryPage />} />
      <Route path="/tracks/:slug/quiz" element={<QuizPage />} />
      <Route path="/tracks/:slug/exam" element={<ExamPage />} />
      <Route path="/login/success" element={<LoginSuccessPage />} />
      <Route path="/login/failed" element={<LoginFailedPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminTracksPage />} />
        <Route path="tracks/:trackId" element={<AdminCategoriesPage />} />
        <Route
          path="tracks/:trackId/categories/:categoryId"
          element={<AdminQuestionsPage />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
