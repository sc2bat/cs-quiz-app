import { Request, Response } from 'express';
import { systemService } from "../services/systemService";
import { asyncHandler } from "../utils/asyncHandler";
import logger from '../utils/logger';
import { getPackageVersion } from '../utils/packageInfo';

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
    getVersion:
        asyncHandler(
            async function(_req: Request, res: Response) {
                logger.debug(`systemController getVersion`);
                res.json({
                    status: 'success',
                    version: getPackageVersion(),
                });
            }
        ),
}
