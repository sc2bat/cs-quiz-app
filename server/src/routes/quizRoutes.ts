import { Router } from 'express';
import { quizController } from '../controllers/quizController';

const router = Router();

// GET /api/quiz 주소로 요청시
router.get('/categories', quizController.getCategories);
router.get('/quizzes', quizController.getQuizzes);

export default router;