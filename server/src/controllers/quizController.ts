import { Request, Response } from 'express';
import { quizService } from '../services/quizService';
import logger from '../utils/logger';
import { asyncHandler } from '../utils/asyncHandler';

export const quizController = {
  getQuizzes:
    asyncHandler(
      async function (req: Request, res: Response) {
        logger.debug(`quizController getQuizzes`);
        const { categoryIds, quizLimit, track } = req.query;

        let parsedCategoryIds: number[] = [];

        if (typeof categoryIds === 'string') {
          parsedCategoryIds = categoryIds
            .split(',')
            .map((id) => Number(id))
            .filter((id) => !Number.isNaN(id));
        }

        if (parsedCategoryIds.length === 0) {
          return res.status(400).json({ message: 'Category IDs are required.' });
        }

        const trackSlug = typeof track === 'string' && track.length > 0 ? track : undefined;
        const quizzes = await quizService.getQuizzesByCategoryIds(
          parsedCategoryIds,
          quizLimit ? Number(quizLimit) : undefined,
          trackSlug
        );

        if (quizzes === null) {
          return res.status(404).json({ message: 'Track not found.' });
        }

        logger.info(`Fetched quizzes count: ${quizzes.length}`);

        if (quizzes.length === 0) {
          return res.status(404).json({ message: 'No quizzes found.' });
        }

        res.json({
          status: 'success',
          count: quizzes.length,
          data: quizzes
        });
      }
    ),
  getCategories:
    asyncHandler(
      async function (req: Request, res: Response) {
        logger.debug(`quizController getCategories`);
        const trackSlug = typeof req.query.track === 'string' ? req.query.track : undefined;

        const categories = await quizService.getCategories(trackSlug);
        if (categories === null) {
          return res.status(404).json({ message: 'Track not found.' });
        }

        logger.info(`Fetched categories count: ${categories.length}`);

        if (categories.length === 0) {
          return res.status(404).json({ message: 'No Categories found.' });
        }

        res.json({
          status: 'success',
          count: categories.length,
          data: categories
        });
      }
    ),
};
