import { Request, Response } from 'express';
import { quizService } from '../services/quizService';
import logger from '../utils/logger';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types/auth';

export const quizRecordController = {
  createQuizRecord:
    asyncHandler(
      async function (req: AuthRequest, res: Response) {
        logger.debug(`quizRecordController createQuizRecord`);
        if (!req.user) {
          logger.debug(`User authentication failed`);
          return res.status(401).json({ message: 'User authentication failed' });
        }
        const userId = req.user.user_id;
        logger.debug(`userId >> ${userId}`);

        const { categoryId, score, totalQuestions } = req.body;
        if (!categoryId || score == undefined || !totalQuestions) {
          logger.debug(`quiz controller create quiz record error`);
          logger.debug(`categoryId >> ${categoryId}`);
          logger.debug(`scroe >> ${score}`);
          logger.debug(`totalQuestions >> ${totalQuestions}`);
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // logger.debug(`userId >> ${userId}`);
        // logger.debug(`category_id >> ${categoryId}`);
        // logger.debug(`score >> ${score}`);
        // logger.debug(`total_questions >> ${totalQuestions}`);

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
        logger.debug(`recordId >> ${recordId}`);
        logger.debug(`Quiz record saved successfully`);  
      }
    ),
  getAllQuizRecord:
    asyncHandler(
      async function (req: AuthRequest, res: Response) {
        logger.debug(`quizRecordController getAllQuizRecord`);
        if (!req.user) {
          logger.debug(`User authentication failed`);
          return res.status(401).json({ message: 'User authentication failed' });
        }
        const userId = req.user.user_id;
        logger.debug(`userId >> ${userId}`);

        const quizRecords = await quizService.getAllQuizRecord(userId);
        
        res.json({
          status: 'success',
          count: quizRecords.length,
          data: quizRecords,
        });
        logger.debug(`records >> ${quizRecords.length}`);
        logger.debug(`Get All Quiz record successfully`);  
      }
    ),

}
