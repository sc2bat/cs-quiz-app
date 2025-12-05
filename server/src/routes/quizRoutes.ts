import { Router } from 'express';
import { getQuizzes } from '../controllers/quizController';

const router = Router();

// GET /api/quizzes 주소로 요청이 오면 getQuizzes 함수 실행
router.get('/', getQuizzes);

export default router;