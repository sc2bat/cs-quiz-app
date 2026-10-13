import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import logger from "../utils/logger";
import { UserRow } from "../types/user";

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

    const decoded = verifyToken(token);

    if(!decoded){
        logger.debug(`decoded >> 토큰이 만료되었거나 유효하지 않은 경우`);
        return res.status(403).json({
            message: 'Invaild or expired token'
        });
    }

    req.user = decoded as UserRow;
    next();
}