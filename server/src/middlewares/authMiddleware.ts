import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import logger from "../utils/logger";
import { UserRow } from "../types/user";
import { QUIZ_SETTINGS } from "../models/constants";

type JwtPayload = {
    user_id: number;
    email?: string;
    nickname?: string;
    role?: string;
    user_role?: string;
};

export function authenticateToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    logger.debug(`function authenticateToken`);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.debug(`authenticateToken: missing access token`);
        return res.status(401).json({
            message: 'Access token required'
        });
    }

    const decoded = verifyToken(token) as JwtPayload | null;

    if (!decoded) {
        logger.debug(`decoded >> 토큰이 만료되었거나 유효하지 않은 경우`);
        return res.status(403).json({
            message: 'Invaild or expired token'
        });
    }

    const role = decoded.role || decoded.user_role || QUIZ_SETTINGS.DEFAULT_USER_ROLE;
    req.user = {
        user_id: decoded.user_id,
        email: decoded.email || '',
        nickname: decoded.nickname || '',
        user_role: role,
    } as UserRow;
    next();
}

export function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const role = req.user?.user_role;
    if (role !== QUIZ_SETTINGS.ADMIN_USER_ROLE) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}
