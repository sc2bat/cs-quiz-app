import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { generateToken } from '../utils/jwt';
import logger from '../utils/logger';

export const authController = {
    socialLoginCallback:
        asyncHandler(
            async function (req: Request, res: Response) {
                const user = req.user as any;

                if (!user) {
                    return res.status(401).json({ message: 'Login failed' });
                }

                // TODO: JWT 토큰(Access/Refresh) 발급
                const token = generateToken(user);
                logger.debug('[!] 로그인 성공 유저:', user.nickname);

                res.cookie('accessToken', token, {
                    httpOnly: true,
                    // secure: process.env.NODE_ENV === 'production',
                    secure: false,
                    maxAge: 24 * 60 * 60 * 1000,
                    sameSite: 'lax',
                    domain: '.dev-dero.shop'
                });

                const clientUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
                res.redirect(clientUrl);
            }),
    getMyProfile(req: Request, res: Response) {
        const decodedUser = req.user;

        if (!decodedUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        res.status(200).json({ 
            user: {
                user_id: decodedUser.user_id,
                email: decodedUser.email,
                nickname: decodedUser.nickname,
                profile_image_url: decodedUser.profile_image_url || null, 
                role: decodedUser.user_role,
                provider: decodedUser.provider || 'local',
                last_login_at: new Date().toISOString() 
            }
        });
    },
    logout(req: Request, res: Response, next: NextFunction) {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            domain: '.dev-dero.shop'
        });

        res.status(200).json({ message: 'Logged out successfully' });
    }
};
