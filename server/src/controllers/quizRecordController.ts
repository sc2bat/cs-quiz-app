import { Request, Response } from 'express';
import { quizService } from '../services/quizService';
import logger from '../utils/logger';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types/auth';

export const quizRecordController = {
  createQuizRecord:
    asyncHandler(
      async function (req: AuthRequest, res: Response) {
        if (!req.user) {
          logger.debug(`User authentication failed`);
          return res.status(401).json({ message: 'User authentication failed' });
        }
        const userId = req.user.user_id;

        const { categoryId, score, totalQuestions } = req.body;
        if (!categoryId || score == undefined || !totalQuestions) {
          logger.debug(`quiz controller create quiz record error`);
          logger.debug(`categoryId >> ${categoryId}`);
          logger.debug(`scroe >> ${score}`);
          logger.debug(`totalQuestions >> ${totalQuestions}`);
          return res.status(400).json({ message: 'Missing required fields' });
        }

        const recordId = await quizService.createQuizRecord({
          user_id: userId,
          category_id: categoryId,
          score: score,
          total_questions: totalQuestions,
        });

        res.status(201).json({
          message: 'Quiz record saved successfully',
          quizRecordId: recordId,
        });
      }
    ),

}
