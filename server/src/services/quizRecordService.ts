import { quizRecordModel } from "../models/quizRecordModel";
import { CreateQuizRecordDto } from "../types/quiz";

export const quizRecordService = {
    async createQuizRecord(dto: CreateQuizRecordDto) {
        const insertId = await quizRecordModel.createQuizRecord(dto);
        return insertId;
    },
    async getAllQuizRecord(userId: number) {
        const rows = await quizRecordModel.getAllQuizRecord(userId);
        return rows;
    },
    async getQuizRecords(
        userId: number,
        limit: number,
        cursor?: { lastTakenAt: Date; lastQuizRecordId: number },
        trackId?: number
    ) {
        if (trackId && (!cursor || !cursor.lastTakenAt || !cursor.lastQuizRecordId)) {
            return await quizRecordModel.getRecentQuizRecordByTrack(userId, trackId, limit);
        }
        if (!cursor || !cursor.lastTakenAt || !cursor.lastQuizRecordId) {
            return await quizRecordModel.getRecentQuizRecord(userId, limit);
        }
        return await quizRecordModel.getQuizRecordByCursor(userId, cursor, limit);
    },
    async deleteQuizRecordsBulk(userId: number, quizRecordIds: number[]) {
        return await quizRecordModel.deleteQuizRecordsBulk(userId, quizRecordIds);
    },
};
