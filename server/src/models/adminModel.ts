import { db } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { ADMIN_QUERIES, QUIZ_QUERIES, TRACK_QUERIES } from './queries';
import { CategoryRow, ChoiceRow, QuestionRow } from '../types/quiz';
import { TrackRow } from '../types/track';

export const adminModel = {
  async getAllTracks(): Promise<TrackRow[]> {
    const [rows] = await db.query<TrackRow[]>(ADMIN_QUERIES.GET_ALL_TRACKS);
    return rows;
  },
  async createTrack(dto: {
    slug: string;
    name: string;
    description?: string | null;
    defaults?: unknown;
    isActive?: boolean;
  }) {
    const result = await db.execute(ADMIN_QUERIES.CREATE_TRACK, [
      dto.slug,
      dto.name,
      dto.description ?? null,
      dto.defaults != null ? JSON.stringify(dto.defaults) : null,
      dto.isActive === false ? 0 : 1,
    ]);
    return result.insertId;
  },
  async updateTrack(
    trackId: number,
    dto: {
      slug: string;
      name: string;
      description?: string | null;
      defaults?: unknown;
      isActive?: boolean;
    }
  ) {
    const result = await db.execute(ADMIN_QUERIES.UPDATE_TRACK, [
      dto.slug,
      dto.name,
      dto.description ?? null,
      dto.defaults != null ? JSON.stringify(dto.defaults) : null,
      dto.isActive === false ? 0 : 1,
      trackId,
    ]);
    return result.affectedRows;
  },
  async deleteTrack(trackId: number) {
    const result = await db.execute(ADMIN_QUERIES.DELETE_TRACK, [trackId]);
    return result.affectedRows;
  },
  async getTrackBySlug(slug: string) {
    const [rows] = await db.query<TrackRow[]>(TRACK_QUERIES.GET_TRACK_BY_SLUG, [slug]);
    return rows[0] ?? null;
  },
  async createCategory(trackId: number, name: string, sortOrder = 0) {
    const result = await db.execute(ADMIN_QUERIES.CREATE_CATEGORY, [
      trackId,
      name,
      sortOrder,
    ]);
    return result.insertId;
  },
  async updateCategory(
    categoryId: number,
    dto: { trackId: number; name: string; sortOrder?: number }
  ) {
    const result = await db.execute(ADMIN_QUERIES.UPDATE_CATEGORY, [
      dto.trackId,
      dto.name,
      dto.sortOrder ?? 0,
      categoryId,
    ]);
    return result.affectedRows;
  },
  async deleteCategory(categoryId: number) {
    const result = await db.execute(ADMIN_QUERIES.DELETE_CATEGORY, [categoryId]);
    return result.affectedRows;
  },
  async getCategoriesByTrackId(trackId: number): Promise<CategoryRow[]> {
    const [rows] = await db.query<CategoryRow[]>(QUIZ_QUERIES.GET_CATEGORIES_BY_TRACK_ID, [
      trackId,
    ]);
    return rows;
  },
  async getQuestionsByCategory(categoryId: number): Promise<QuestionRow[]> {
    const [rows] = await db.query<QuestionRow[]>(ADMIN_QUERIES.GET_QUESTIONS_BY_CATEGORY, [
      categoryId,
    ]);
    return rows;
  },
  async createQuestion(dto: {
    categoryId: number;
    questionType: string;
    questionText: string;
    explanation?: string | null;
    subjectiveAnswer?: string | null;
  }) {
    const result = await db.execute(ADMIN_QUERIES.CREATE_QUESTION, [
      dto.categoryId,
      dto.questionType,
      dto.questionText,
      dto.explanation ?? null,
      dto.subjectiveAnswer ?? null,
    ]);
    return result.insertId;
  },
  async updateQuestion(
    questionId: number,
    dto: {
      categoryId: number;
      questionType: string;
      questionText: string;
      explanation?: string | null;
      subjectiveAnswer?: string | null;
    }
  ) {
    const result = await db.execute(ADMIN_QUERIES.UPDATE_QUESTION, [
      dto.categoryId,
      dto.questionType,
      dto.questionText,
      dto.explanation ?? null,
      dto.subjectiveAnswer ?? null,
      questionId,
    ]);
    return result.affectedRows;
  },
  async deleteQuestion(questionId: number) {
    // Soft delete — keep row for quiz_submissions / wrong_answers FK history
    const result = await db.execute(ADMIN_QUERIES.DEACTIVATE_QUESTION, [questionId]);
    return result.affectedRows;
  },
  async replaceChoices(
    questionId: number,
    choices: { choiceText: string; isCorrect: boolean; sortOrder?: number }[]
  ) {
    await db.execute(ADMIN_QUERIES.DELETE_CHOICES_BY_QUESTION, [questionId]);
    for (let i = 0; i < choices.length; i++) {
      const c = choices[i];
      await db.execute(ADMIN_QUERIES.CREATE_CHOICE, [
        questionId,
        c.choiceText,
        c.isCorrect ? 1 : 0,
        c.sortOrder ?? i,
      ]);
    }
  },
  async getChoicesByQuestionIds(questionIds: number[]): Promise<ChoiceRow[]> {
    if (questionIds.length === 0) return [];
    const [rows] = await db.query<ChoiceRow[]>(QUIZ_QUERIES.GET_CHOICES_BY_QUESTIONS_IDS, [
      questionIds,
    ]);
    return rows;
  },
  async getQuestionById(questionId: number): Promise<QuestionRow | null> {
    const [rows] = await db.query<QuestionRow[]>(ADMIN_QUERIES.GET_QUESTION_WITH_ANSWER, [
      questionId,
    ]);
    return rows[0] ?? null;
  },
  async createSubmission(dto: {
    quizRecordId: number;
    questionId: number;
    choiceId: number | null;
    subjectiveAnswer: string | null;
    isCorrect: boolean;
  }) {
    await db.execute(ADMIN_QUERIES.CREATE_QUIZ_SUBMISSION, [
      dto.quizRecordId,
      dto.questionId,
      dto.choiceId,
      dto.subjectiveAnswer,
      dto.isCorrect ? 1 : 0,
    ]);
  },
};
