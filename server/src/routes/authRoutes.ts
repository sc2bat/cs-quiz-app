import { Router } from 'express';
import passport from '../config/passport';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/login/failed',
        session: false
    }),
    authController.socialLoginCallback
);

router.get('/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/api/auth/login/failed',
        session: false
    }),
    authController.socialLoginCallback
);

router.get('/login/failed', authController.loginFailed);
router.post('/exchange', authController.exchangeCode);
router.post('/logout', authenticateToken, authController.logout);

export default router;
