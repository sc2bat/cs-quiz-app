import { Router } from 'express';
import { systemController } from '../controllers/systemController';

const router = Router();

// GET /api/system 주소로 요청시
router.get('/db-check', systemController.checkDatabase);
router.get('/date', systemController.getServerTime);

export default router;