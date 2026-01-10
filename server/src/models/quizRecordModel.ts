import { ResultSetHeader } from "mysql2/promise";
import { db } from "../config/db";
import { CreateFullRecordDTO, QuizRecordRow } from "../types/quiz";
import { TABLES } from "./constants";
import { QUIZ_RECORD_QUERIES } from "./queries";

// refactor: convert arrow functions to method shorthand
export const quizRecordModel = {
    async createQuizRecord(dto: CreateFullRecordDTO): Promise<number> {
    return await db.transaction(async (conn) => {
      
      const [recordResult] = await conn.execute<ResultSetHeader>(
        QUIZ_RECORD_QUERIES.CREATE_QUIZ_RECORD,
        [dto.user_id, dto.score, dto.total_questions]
      );
      const recordId = recordResult.insertId;

      if (dto.category_ids && dto.category_ids.length > 0) {
        const categoryValues = dto.category_ids.map(catId => [recordId, catId]);
        await conn.query(
          QUIZ_RECORD_QUERIES.CREATE_RECORD_CATEGORIES,
          [categoryValues]
        );
      }

      if (dto.submissions && dto.submissions.length > 0) {
        const submissionValues = dto.submissions.map(sub => [
          recordId,
          sub.questionId,
          sub.choiceId || null,
          sub.subjectiveAnswer || null,
          sub.isCorrect ? 1 : 0
        ]);
        await conn.query(
          QUIZ_RECORD_QUERIES.CREATE_SUBMISSIONS,
          [submissionValues]
        );
      }

      return recordId;
    });
  },
    async getAllQuizRecord(userId: number): Promise<QuizRecordRow[]> {
        const [rows] = await db.query<QuizRecordRow[]>(
            QUIZ_RECORD_QUERIES.GET_ALL_QUIZ_RECORDS,
            [userId]
        );
        return rows;
    },
    async getRecentQuizRecord(userId: number, limit: number): Promise<QuizRecordRow[]> {
        const [rows] = await db.query<QuizRecordRow[]>(
            QUIZ_RECORD_QUERIES.GET_RECENT_QUIZ_RECORDS,
            [ userId, limit ]
        );
        return rows;
    },
    async getQuizRecordByCursor(
        userId: number,
        cursor: {
            lastTakenAt: Date;
            lastQuizRecordId: number;
        },
        limit: number
    ): Promise<QuizRecordRow[]> {
        const [rows] = await db.query<QuizRecordRow[]>(
            QUIZ_RECORD_QUERIES.GET_QUIZ_RECORDS_BY_CURSOR,
            [
                userId,
                cursor.lastTakenAt,
                cursor.lastTakenAt,
                cursor.lastQuizRecordId,
                limit
            ]
        );
        return rows;
    },
    // TODO: Refactor bulk delete logic to handle Foreign Key constraints (consider using ON DELETE CASCADE or transactional deletion of child records first).
    async deleteQuizRecordsBulk(userId: number, quizRecordIds: number[]): Promise<number> {
        if(quizRecordIds.length === 0) return 0;

        const placeholders = quizRecordIds.map(() => '?').join(', ');

        const deleteQuizRecordsBulk = `
            DELETE FROM ${TABLES.QUIZ_RECORDS}
                WHERE 1=1
                    AND user_id = ?
                    AND quiz_record_id IN (${placeholders})
        `;

        const result = await db.execute(
            deleteQuizRecordsBulk,
            [ userId, ...quizRecordIds ]
        );

        return result.affectedRows;
    },
};
