import { Router } from 'express';
import { quizController } from '../controllers/quizController';
import { quizRecordController } from '../controllers/quizRecordController';

const router = Router();

// GET /api/quiz 주소로 요청시
router.get('/categories', quizController.getCategories);
router.get('/quizzes', quizController.getQuizzes);

// POST /api/quiz 로 요청시
router.post('/records', quizRecordController.createQuizRecord);

export default router;