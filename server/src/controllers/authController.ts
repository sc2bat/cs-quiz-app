import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

export const authController = {
    socialLoginCallback: asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as any;

        if (!user) {
            return res.status(401).json({ message: 'Login failed' });
        }

        // TODO: JWT 토큰(Access/Refresh) 발급
        // 일단은 임시로 콘솔에만 찍고 리다이렉트 시키겠습니다.
        console.log('[!] 로그인 성공 유저:', user.nickname);

        // 2. 프론트엔드(React)로 이동!
        // 토큰은 보통 Query String이나 Cookie에 담아서 보냅니다.
        // 예: http://localhost:5173/login/success?token=...
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        
        // (임시) 로그인 성공했다는 신호와 함께 홈으로 보냄
        res.redirect(`${clientUrl}/login/success?snsId=${user.sns_id}`);
    }),

    logout: (req: Request, res: Response, next: NextFunction) => {
        // Passport session을 쓴다면 req.logout() 필요, JWT면 클라이언트에서 토큰 삭제하면 됨
        res.status(200).json({ message: 'Logged out successfully' });
    }
};