import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { generateToken } from '../utils/jwt';
import { issueLoginCode, consumeLoginCode } from '../utils/loginCodeStore';
import { resolveClientAppUrl } from '../utils/clientUrl';
import logger from '../utils/logger';

export const authController = {
    socialLoginCallback: asyncHandler(async function (req: Request, res: Response) {
        const user = req.user as Express.User | undefined;

        if (!user) {
            return res.status(401).json({ message: 'Login failed' });
        }

        const token = generateToken(user as any);
        const code = issueLoginCode(token);
        const clientUrl = resolveClientAppUrl();

        logger.info(`Login success user=${user.nickname} redirect=${clientUrl}`);
        res.redirect(`${clientUrl}/login/success?code=${encodeURIComponent(code)}`);
    }),

    exchangeCode: asyncHandler(async function (req: Request, res: Response) {
        const code = typeof req.body?.code === 'string' ? req.body.code : '';
        if (!code) {
            return res.status(400).json({ message: 'code is required' });
        }

        const token = consumeLoginCode(code);
        if (!token) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        res.json({ status: 'success', token });
    }),

    logout: asyncHandler(async function (_req: Request, res: Response) {
        // Client discards JWT; endpoint exists for symmetry / future cookie clear.
        res.status(200).json({ message: 'Logged out successfully' });
    }),

    loginFailed: asyncHandler(async function (_req: Request, res: Response) {
        const clientUrl = resolveClientAppUrl();
        res.redirect(`${clientUrl}/login/failed`);
    }),
};
