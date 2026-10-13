import { Router } from 'express';
import { trackController } from '../controllers/trackController';

const router = Router();

router.get('/', trackController.getTracks);
router.get('/:slug/categories', trackController.getCategoriesByTrackSlug);

export default router;
