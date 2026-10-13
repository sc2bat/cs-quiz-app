import { Request, Response } from 'express';
import { quizService } from '../services/quizService';
import { examService } from '../services/examService';
import logger from '../utils/logger';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyToken } from '../utils/jwt';

function optionalUserId(req: Request): number | undefined {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return undefined;
  const decoded = verifyToken(token) as { user_id?: number } | null;
  return decoded?.user_id;
}

export const quizController = {
  getQuizzes:
    asyncHandler(
      async function (req: Request, res: Response) {
        logger.debug(`quizController getQuizzes`);
        const { categoryIds, quizLimit, track, mode } = req.query;

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
        const isExam = mode === 'exam';

        const quizzes = isExam
          ? await examService.getExamQuizzes(
              parsedCategoryIds,
              quizLimit ? Number(quizLimit) : undefined,
              trackSlug
            )
          : await quizService.getQuizzesByCategoryIds(
              parsedCategoryIds,
              quizLimit ? Number(quizLimit) : undefined,
              trackSlug
            );

        if (quizzes === null) {
          return res.status(404).json({ message: 'Track not found.' });
        }

        logger.info(`Fetched quizzes count: ${quizzes.length} mode=${isExam ? 'exam' : 'practice'}`);

        if (quizzes.length === 0) {
          return res.status(404).json({ message: 'No quizzes found.' });
        }

        res.json({
          status: 'success',
          mode: isExam ? 'exam' : 'practice',
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
  getQuestionsByIds:
    asyncHandler(
      async function (req: Request, res: Response) {
        const { ids, track } = req.query;
        if (typeof ids !== 'string' || ids.trim().length === 0) {
          return res.status(400).json({ message: 'Question IDs are required.' });
        }

        const parsedIds = ids
          .split(',')
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id));

        if (parsedIds.length === 0) {
          return res.status(400).json({ message: 'Question IDs are required.' });
        }

        const trackSlug = typeof track === 'string' && track.length > 0 ? track : undefined;
        const quizzes = await quizService.getQuizzesByIds(parsedIds, trackSlug);

        if (quizzes === null) {
          return res.status(404).json({ message: 'Track not found.' });
        }

        if (quizzes.length === 0) {
          return res.status(404).json({ message: 'No quizzes found.' });
        }

        res.json({
          status: 'success',
          count: quizzes.length,
          data: quizzes,
        });
      }
    ),
  submitExam:
    asyncHandler(
      async function (req: Request, res: Response) {
        const { trackId, answers } = req.body || {};
        if (!trackId || !Array.isArray(answers) || answers.length === 0) {
          return res.status(400).json({ message: 'trackId and answers[] required' });
        }

        try {
          const result = await examService.submitExam({
            userId: optionalUserId(req),
            trackId: Number(trackId),
            answers: answers.map((a: any) => ({
              questionId: Number(a.questionId),
              choiceId: a.choiceId != null ? Number(a.choiceId) : null,
              subjectiveAnswer: a.subjectiveAnswer ?? null,
            })),
          });
          res.json({ status: 'success', data: result });
        } catch (error: any) {
          const status = error?.status || 500;
          return res.status(status).json({ message: error?.message || 'Exam submit failed' });
        }
      }
    ),
};
