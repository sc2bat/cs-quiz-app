import { quizRecordModel } from "../models/quizRecordModel";
import { CreateFullRecordDTO, CreateRecordServiceParams } from "../types/quiz";
import logger from "../utils/logger";

export const quizRecordService = {
  createQuizRecord: async (params: CreateRecordServiceParams) => {
    logger.debug('quizRecordService.createQuizRecord');

    const createDTO: CreateFullRecordDTO = {
      user_id: params.user_id,
      category_ids: params.category_ids,
      score: params.score,
      total_questions: params.total_questions,
      submissions: params.submissions
    };

    const recordId = await quizRecordModel.createQuizRecord(createDTO);
    
    return recordId;
  },
  getAllQuizRecord: async (userId: number) => {
    logger.debug(`quizRecordService.getAllQuizRecord userId: ${userId}`);
    return await quizRecordModel.getAllQuizRecord(userId);
  },
  getQuizRecords: async (
    userId: number, 
    limit: number, 
    cursor?: { lastTakenAt: Date; lastQuizRecordId: number }
  ) => {
    logger.debug(`quizRecordService.getQuizRecords userId: ${userId}, limit: ${limit}`);
    if (cursor) {
      logger.debug('Fetching with cursor');
      return await quizRecordModel.getQuizRecordByCursor(userId, cursor, limit);
    } else {
      logger.debug('Fetching recent records (First page)');
      return await quizRecordModel.getRecentQuizRecord(userId, limit); 
    }
  },
  deleteQuizRecordsBulk: async (userId: number, quizRecordIds: number[]) => {
    logger.debug(`quizRecordService.deleteQuizRecordsBulk count: ${quizRecordIds.length}`);
    return await quizRecordModel.deleteQuizRecordsBulk(userId, quizRecordIds);
  }
};