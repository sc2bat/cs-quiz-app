import { Router } from 'express';
import passport from '../config/passport'; // 설정한 passport 가져오기
import { authController } from '../controllers/authController';

const router = Router();

// Google 로그인 라우터
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/auth/login/failed', // 실패 시 이동할 주소
        session: false // JWT 쓸거라 세션 끔
    }),
    authController.socialLoginCallback
);

// GitHub 로그인 라우터
router.get('/github', 
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback', 
    passport.authenticate('github', { 
        failureRedirect: '/auth/login/failed', 
        session: false 
    }),
    authController.socialLoginCallback
);

export default router;