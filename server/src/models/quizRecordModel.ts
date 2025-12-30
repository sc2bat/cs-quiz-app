import { db } from "../config/db";
import { QuizRecordRow, CreateQuizRecordDto } from "../types/quiz";
import { TABLES } from "./constants";
import { QUIZ_RECORD_QUERIES } from "./queries";

// refactor: convert arrow functions to method shorthand
export const quizRecordModel = {
    async createQuizRecord(dto: CreateQuizRecordDto): Promise<number> {
        const result = await db.execute(
            QUIZ_RECORD_QUERIES.CREATE_QUIZ_RECORD,
            [
                dto.user_id,
                dto.category_id,
                dto.score,
                dto.total_questions,
            ]
        );
        return result.insertId;
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
