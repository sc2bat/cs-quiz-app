import { Request, Response } from 'express';
import { quizService } from '../services/quizService';
import logger from '../utils/logger';

export const getQuizzes = async (req: Request, res: Response) => {
  try {

    const data = await quizService.getQuizzes();

    if (data.length === 0) {
      return res.status(404).json({ message: 'No quizzes found.' });
    }

    res.json({
      status: 'success',
      count: data.length,
      data: data
    });

  } catch (error) {
    console.error(error);

    if(error instanceof Error){
    logger.error(`[getQuizzes Error] ${error.message}`, { stack: error.stack});
    }else {
      logger.error(`[Unknown Error] ${String(error)}`);
    }
    
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};