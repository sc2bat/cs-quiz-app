import { Router } from 'express';
import { quizController } from '../controllers/quizController';
import { quizRecordController } from '../controllers/quizRecordController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/quiz 주소로 요청시
// question
router.get('/categories', quizController.getCategories);
router.get('/quizzes', quizController.getQuizzes);

// quiz record
// router.get('/records', authenticateJWT, quizRecordController.getAllQuizRecord);
router.get('/records', authenticateJWT, quizRecordController.getQuizRecords);

// POST /api/quiz 로 요청시
// quiz record
router.post('/records', authenticateJWT, quizRecordController.createQuizRecord);
router.delete('/records', authenticateJWT, quizRecordController.deleteQuizRecordsBulk);

export default router;
