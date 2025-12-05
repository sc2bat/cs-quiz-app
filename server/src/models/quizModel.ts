import { db } from "../config/db";
import { QuestionRow, ChoiceRow } from "../types/quiz";
import { QUERIES } from "./queries";

export const quizModel = {
    getAllQuestions: async (): Promise<QuestionRow[]> => {
        const [rows] = await db.query<QuestionRow[]>(QUERIES.GET_ALL_QUESTIONS);
        return rows;
    },

    getAllChoices: async (): Promise<ChoiceRow[]> => {
        const [rows] = await db.query<ChoiceRow[]>(QUERIES.GET_ALL_CHOICES);
        return rows;
    }
};