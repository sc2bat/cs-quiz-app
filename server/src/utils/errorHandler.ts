import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export const globalErrorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = error.status || 500;
    const errorMessage = error.mesage || 'An internal server error occurred.';


    if (statusCode === 500) {
        logger.error(`[Server Error] ${errorMessage}`, { stack: error.stack });
    } else {
        logger.error(`[${statusCode} Error] ${errorMessage}`);
    }

    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message: errorMessage
    });
}