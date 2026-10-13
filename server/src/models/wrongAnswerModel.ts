import { db } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { WRONG_ANSWER_QUERIES } from './queries';

export interface WrongAnswerRow extends RowDataPacket {
  user_id: number;
  track_id: number;
  question_id: number;
  wrong_count: number;
  last_wrong_at: Date;
}

export const wrongAnswerModel = {
  async upsert(userId: number, trackId: number, questionId: number) {
    await db.execute(WRONG_ANSWER_QUERIES.UPSERT_WRONG_ANSWER, [
      userId,
      trackId,
      questionId,
    ]);
  },
  async getByTrack(userId: number, trackId: number): Promise<WrongAnswerRow[]> {
    const [rows] = await db.query<WrongAnswerRow[]>(
      WRONG_ANSWER_QUERIES.GET_WRONG_ANSWERS_BY_TRACK,
      [userId, trackId]
    );
    return rows;
  },
  async getAll(userId: number): Promise<WrongAnswerRow[]> {
    const [rows] = await db.query<WrongAnswerRow[]>(
      WRONG_ANSWER_QUERIES.GET_ALL_WRONG_ANSWERS,
      [userId]
    );
    return rows;
  },
  async clearByTrack(userId: number, trackId: number) {
    const result = await db.execute(WRONG_ANSWER_QUERIES.CLEAR_WRONG_ANSWERS_BY_TRACK, [
      userId,
      trackId,
    ]);
    return result.affectedRows;
  },
};
