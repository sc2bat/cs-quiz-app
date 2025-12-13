import { Router } from 'express';
import { systemController } from '../controllers/systemController';

const router = Router();

// GET /api/system 주소로 요청시
router.get('/db-check', systemController.checkDatabase);

export default router;