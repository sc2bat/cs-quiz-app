import { wrongAnswerModel } from '../models/wrongAnswerModel';

export const wrongAnswerService = {
  async merge(userId: number, trackId: number, questionIds: number[]) {
    const unique = [...new Set(questionIds.filter((id) => !Number.isNaN(id)))];
    for (const questionId of unique) {
      await wrongAnswerModel.upsert(userId, trackId, questionId);
    }
    const rows = await wrongAnswerModel.getByTrack(userId, trackId);
    return rows.map((row) => ({
      questionId: row.question_id,
      trackId: row.track_id,
      wrongCount: row.wrong_count,
      lastWrongAt: row.last_wrong_at,
    }));
  },
  async list(userId: number, trackId?: number) {
    const rows = trackId
      ? await wrongAnswerModel.getByTrack(userId, trackId)
      : await wrongAnswerModel.getAll(userId);
    return rows.map((row) => ({
      questionId: row.question_id,
      trackId: row.track_id,
      wrongCount: row.wrong_count,
      lastWrongAt: row.last_wrong_at,
    }));
  },
  async clearTrack(userId: number, trackId: number) {
    return wrongAnswerModel.clearByTrack(userId, trackId);
  },
};
