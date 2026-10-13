import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';
import { adminController } from '../controllers/adminController';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/tracks', adminController.listTracks);
router.post('/tracks', adminController.createTrack);
router.patch('/tracks/:trackId', adminController.updateTrack);
router.delete('/tracks/:trackId', adminController.deleteTrack);

router.get('/categories', adminController.listCategories);
router.post('/categories', adminController.createCategory);
router.patch('/categories/:categoryId', adminController.updateCategory);
router.delete('/categories/:categoryId', adminController.deleteCategory);

router.get('/questions', adminController.listQuestions);
router.post('/questions', adminController.createQuestion);
router.patch('/questions/:questionId', adminController.updateQuestion);
router.delete('/questions/:questionId', adminController.deleteQuestion);

export default router;
