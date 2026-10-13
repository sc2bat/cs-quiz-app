import { Router } from 'express';
import { quizController } from '../controllers/quizController';
import { quizRecordController } from '../controllers/quizRecordController';
import { wrongAnswerController } from '../controllers/wrongAnswerController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/categories', quizController.getCategories);
router.get('/quizzes', quizController.getQuizzes);
router.get('/questions', quizController.getQuestionsByIds);

router.get('/records', authenticateToken, quizRecordController.getQuizRecords);
router.post('/records', authenticateToken, quizRecordController.createQuizRecord);
router.delete('/records', authenticateToken, quizRecordController.deleteQuizRecordsBulk);

router.get('/wrong-answers', authenticateToken, wrongAnswerController.list);
router.post('/wrong-answers/merge', authenticateToken, wrongAnswerController.merge);
router.delete('/wrong-answers', authenticateToken, wrongAnswerController.clearTrack);

export default router;
