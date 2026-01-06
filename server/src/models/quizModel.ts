import { db } from "../config/db";
import { QuestionRow, ChoiceRow, CategoryRow } from "../types/quiz";
import { QUIZ_QUERIES } from "./queries";

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
};
