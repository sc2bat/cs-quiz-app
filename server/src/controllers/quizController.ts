import { Request, Response } from 'express';
import { quizService } from '../services/quizService';
import logger from '../utils/logger';
import { asyncHandler } from '../utils/asyncHandler';

export const quizController = {
  getQuizzes:
    asyncHandler(
      async function (req: Request, res: Response) {
        logger.debug(`quizController getQuizzes`);
        const { categoryIds } = req.query;
        const { quizLimit } = req.query;

        let parsedCategoryIds: number[] = [];

        if (typeof categoryIds === 'string') {
          parsedCategoryIds = categoryIds.split(',').map(id => Number(id));
        }

        if (parsedCategoryIds.length === 0) {
          return res.status(400).json({ message: 'Category IDs are required.' });
        }

        logger.debug(`quizLimit: ${quizLimit}`);
        const quizzes = await quizService.getQuizzesByCategoryIds(parsedCategoryIds, quizLimit ? Number(quizLimit) : undefined);
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

        const categories = await quizService.getCategories();
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
}
