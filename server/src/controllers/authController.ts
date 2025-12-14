import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

export const authController = {
    socialLoginCallback: asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as any;

        if (!user) {
            return res.status(401).json({ message: 'Login failed' });
        }

        // TODO: JWT 토큰(Access/Refresh) 발급
        console.log('[!] 로그인 성공 유저:', user.nickname);

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        
        res.redirect(`${clientUrl}/login/success?snsId=${user.sns_id}`);
    }),

    logout: (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json({ message: 'Logged out successfully' });
    }
};