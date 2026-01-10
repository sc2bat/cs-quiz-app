import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function authenticateJWT(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.cookies.accessToken;

    logger.debug(`token >> ${token}`);

    if (!token) {
        logger.debug(`token >> 토큰이 없는 경우`);
        return next();
    }

    const decoded = verifyToken(token);

    if (decoded) {
        // 검증 성공 시 req.user에 정보 담기
        req.user = decoded;
    } else {
        // 검증 실패 (만료, 변조 등) -> 쿠키 삭제
        logger.warn('[Auth] Token verification failed. Clearing cookie.');
        res.clearCookie('accessToken');
    }
    next();
}