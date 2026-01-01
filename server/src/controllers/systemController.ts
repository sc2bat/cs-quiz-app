import { Request, Response } from 'express';
import { systemService } from "../services/systemService";
import { asyncHandler } from "../utils/asyncHandler";
import logger from '../utils/logger';

export const systemController = {
    checkDatabase:
        asyncHandler(
            async function(req: Request, res: Response) {
                logger.debug(`systemController checkDatabase`);
                const data = await systemService.checkDatabaseConnection();
                logger.info(`Fetched quizzes count: ${data.length}`);

                res.json({
                    status: 'success',
                    count: data.length,
                    data: data
                });
            }
        ),
    getServerTime:
        asyncHandler(
            async function(req: Request, res: Response) {
                logger.debug(`systemController getServerTime`);
                const databaseDateTime = await systemService.getDatabaseDateTime();

                res.json({
                    status: 'success',
                    serverTime: new Date(),
                    databaseDateTime: databaseDateTime
                });
            }
        ),
}
