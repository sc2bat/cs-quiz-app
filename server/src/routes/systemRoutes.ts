import { Router, Request, Response, NextFunction } from 'express';
import { systemController } from '../controllers/systemController';

const router = Router();

/** Block sensitive system probes outside development */
function allowDevOnly(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }
  return next();
}

router.get('/db-check', allowDevOnly, systemController.checkDatabase);
router.get('/version', allowDevOnly, systemController.getVersion);
router.get('/date', systemController.getServerTime);

export default router;
