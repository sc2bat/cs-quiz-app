import { db } from "../config/db";
import { QuestionRow, ChoiceRow, CategoryRow, QuizRecordRow, CreateQuizRecordDto } from "../types/quiz";
import { CreateUserDto } from "../types/user";
import { QUIZ_QUERIES, QUIZ_RECORD_QUERIES } from "./queries";

// refactor: convert arrow functions to method shorthand
export const quizModel = {
    async getAllQuestions(): Promise<QuestionRow[]> {
        const [rows] = await db.query<QuestionRow[]>(
            QUIZ_QUERIES.GET_ALL_RANDOM_QUESTIONS
        );
        return rows;
    },
    async getAllChoices(): Promise<ChoiceRow[]> {
        const [rows] = await db.query<ChoiceRow[]>(
            QUIZ_QUERIES.GET_ALL_CHOICES
        );
        return rows;
    },
    async getQuestionsByCategoryIds(categoryIds: number[], limit: number): Promise<QuestionRow[]> {
        const [rows] = await db.query<QuestionRow[]>(
            QUIZ_QUERIES.GET_RANDOM_QUESTIONS_BY_CATEGORY_IDS, 
            [categoryIds, limit]
        );
        return rows;
    },
    async getChoicesByQuestionsIds(questionIds: number[]): Promise<ChoiceRow[]> {
        const [rows] = await db.query<ChoiceRow[]>(
            QUIZ_QUERIES.GET_CHOICES_BY_QUESTIONS_IDS, 
            [questionIds]
        );
        return rows;
    },
    async getCategories(): Promise<CategoryRow[]> {
        const [rows] = await db.query<CategoryRow[]>(
            QUIZ_QUERIES.GET_ALL_CATEGORIES
        );
        return rows;
    },
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
    }

};
