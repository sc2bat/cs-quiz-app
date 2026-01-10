import { Response } from 'express';
import { quizRecordService } from '../services/quizRecordService';
import { AuthRequest } from '../types/auth';
import { asyncHandler } from '../utils/asyncHandler';
import logger from '../utils/logger';

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

        const { categoryIds, score, totalQuestions, submissions } = req.body;
        if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0 ||
          score == undefined || !totalQuestions ||
          !submissions || !Array.isArray(submissions)) {
          logger.debug(`quiz controller create quiz record error`);
          logger.debug(`categoryIds >> ${categoryIds}`);
          logger.debug(`scroe >> ${score}`);
          logger.debug(`totalQuestions >> ${totalQuestions}`);
          logger.debug(`submissions >> ${submissions}`);
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // logger.debug(`userId >> ${userId}`);
        // logger.debug(`category_id >> ${categoryId}`);
        // logger.debug(`score >> ${score}`);
        // logger.debug(`total_questions >> ${totalQuestions}`);

        const recordId = await quizRecordService.createQuizRecord({
          user_id: userId,
          category_ids: categoryIds,
          score: score,
          total_questions: totalQuestions,
          submissions: submissions,
        });

        logger.debug(`recordId >> ${recordId}`);
        logger.debug(`Quiz record saved successfully`);

        return res.status(201).json({
          status: 'success',
          message: 'Quiz record saved successfully',
          data: {
            quizRecordId: recordId
          }
        });
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

        const quizRecords = await quizRecordService.getAllQuizRecord(userId);

        logger.debug(`records >> ${quizRecords.length}`);
        logger.debug(`Get All Quiz record successfully`);

        return res.status(200).json({
          status: 'success',
          count: quizRecords.length,
          data: quizRecords,
        });
      }
    ),
  getQuizRecords:
    asyncHandler(
      async function (req: AuthRequest, res: Response) {
        logger.debug(`quizRecordController getAllQuizRecord`);
        if (!req.user) {
          logger.debug(`User authentication failed`);
          return res.status(401).json({ message: 'User authentication failed' });
        }
        const userId = req.user.user_id;
        const { limit, lastTakenAt, lastQuizRecordId } = req.query;
        const reqlimit = limit ? Number(limit) : 10;
        const cursor = (lastTakenAt && lastQuizRecordId) ? {
          lastTakenAt: new Date(lastTakenAt as string),
          lastQuizRecordId: Number(lastQuizRecordId)
        } : undefined;
        logger.debug(`userId >> ${userId}`);

        const quizRecords = await quizRecordService.getQuizRecords(userId, reqlimit, cursor);

        logger.debug(`records >> ${quizRecords.length}`);
        logger.debug(`Get All Quiz record successfully`);

        return res.status(200).json({
          status: 'success',
          count: quizRecords.length,
          data: quizRecords,
        });
      }
    ),
  deleteQuizRecordsBulk:
    asyncHandler(
      async function (req: AuthRequest, res: Response) {
        logger.debug(`quizRecordController deleteQuizRecordsBulk`);
        if (!req.user) {
          logger.debug(`User authentication failed`);
          return res.status(401).json({ message: 'User authentication failed' });
        }
        const userId = req.user.user_id;
        logger.debug(`userId >> ${userId}`);

        const { quizRecordIds } = req.body;

        if (!quizRecordIds || !Array.isArray(quizRecordIds) || quizRecordIds.length === 0) {
          logger.debug(`Invalid record IDs provided`);
          return res.status(400).json({ message: "Invalid record IDs provided" });
        }

        const deletedCount = await quizRecordService.deleteQuizRecordsBulk(userId, quizRecordIds);

        logger.debug(`Deleted Count >> ${deletedCount}`);
        logger.debug(`Delete Quiz record successfully`);

        return res.status(200).json({
          status: 'success',
          message: "Quiz records deleted successfully",
          data: {
            deletedCount: deletedCount
          }
        });
      }
    ),
}
