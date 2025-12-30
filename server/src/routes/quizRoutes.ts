import { Router } from 'express';
import { quizController } from '../controllers/quizController';
import { quizRecordController } from '../controllers/quizRecordController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/quiz 주소로 요청시
// question
router.get('/categories', quizController.getCategories);
router.get('/quizzes', quizController.getQuizzes);

// quiz record
// router.get('/records', authenticateToken, quizRecordController.getAllQuizRecord);
router.get('/records', authenticateToken, quizRecordController.getQuizRecords);

// POST /api/quiz 로 요청시
// quiz record
router.post('/records', authenticateToken, quizRecordController.createQuizRecord);
router.delete('/records', authenticateToken, quizRecordController.deleteQuizRecordsBulk);

export default router;
