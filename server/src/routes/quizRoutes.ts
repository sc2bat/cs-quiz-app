import { Router } from 'express';
import { quizController } from '../controllers/quizController';
import { quizRecordController } from '../controllers/quizRecordController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/quiz 주소로 요청시
router.get('/categories', quizController.getCategories);
router.get('/quizzes', quizController.getQuizzes);

// POST /api/quiz 로 요청시
router.post('/records', authenticateToken, quizRecordController.createQuizRecord);
router.get('/records', authenticateToken, quizRecordController.getAllQuizRecord);

export default router;