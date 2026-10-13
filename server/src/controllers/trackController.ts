import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { trackService } from '../services/trackService';
import logger from '../utils/logger';

export const trackController = {
    getTracks: asyncHandler(async function (_req: Request, res: Response) {
        const tracks = await trackService.getTracks();
        logger.info(`Fetched tracks count: ${tracks.length}`);
        res.json({
            status: 'success',
            count: tracks.length,
            data: tracks,
        });
    }),
    getCategoriesByTrackSlug: asyncHandler(async function (req: Request, res: Response) {
        const slug = String(req.params.slug || '');
        const result = await trackService.getCategoriesByTrackSlug(slug);
        if (!result) {
            return res.status(404).json({ message: 'Track not found.' });
        }
        res.json({
            status: 'success',
            data: result,
        });
    }),
};
