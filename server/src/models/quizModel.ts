import { db } from "../config/db";
import { QuestionRow, ChoiceRow, CategoryRow } from "../types/quiz";
import { QUIZ_QUERIES } from "./queries";

export const quizModel = {
    getAllQuestions: async (): Promise<QuestionRow[]> => {
        const [rows] = await db.query<QuestionRow[]>(
            QUIZ_QUERIES.GET_ALL_RANDOM_QUESTIONS
        );
        return rows;
    },
    getAllChoices: async (): Promise<ChoiceRow[]> => {
        const [rows] = await db.query<ChoiceRow[]>(
            QUIZ_QUERIES.GET_ALL_CHOICES
        );
        return rows;
    },
    getQuestionsByCategoryIds: async (categoryIds: number[], limit: number): Promise<QuestionRow[]> => {
        const [rows] = await db.query<QuestionRow[]>(
            QUIZ_QUERIES.GET_RANDOM_QUESTIONS_BY_CATEGORY_IDS, 
            [categoryIds, limit]
        );
        return rows;
    },
    getChoicesByQuestionsIds: async(questionIds: number[]) : Promise<ChoiceRow[]> => {
        const [rows] = await db.query<ChoiceRow[]>(
            QUIZ_QUERIES.GET_CHOICES_BY_QUESTIONS_IDS, 
            [questionIds]
        );
        return rows;
    },
    getCategories: async(): Promise<CategoryRow[]> => {
        const [rows] = await db.query<CategoryRow[]>(
            QUIZ_QUERIES.GET_ALL_CATEGORIES
        );
        return rows;
    }
};