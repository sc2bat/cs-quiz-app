import { TABLES } from "./constants";

export const QUERIES = {
    GET_NOW_TIMESTAMP:`
        SELECT NOW() as now
    `,

    GET_ALL_QUESTIONS: `
        SELECT * FROM questions
            ORDER BY RAND()
    `,
    GET_ALL_CHOICES: `
        SELECT * FROM choices
    `,

} as const

export const COMMON_QUERIES = {
    GET_NOW:`
        SELECT NOW() as now
    `,
} as const;

export const QUIZ_QUERIES = {
    GET_ALL_QUESTIONS_RANDOM: `
        SELECT * FROM ${TABLES.QUESTIONS}
            ORDER BY RAND()
    `,

    GET_ALL_CATEGORIES: `
        SELECT * FROM ${TABLES.CATEGORIES}
    `,

    GET_QUESTIONS_BY_CATEGORY_IDS: `
        SELECT 
            q.id, 
            q.question_type, 
            q.question_text, 
            q.explanation, 
            q.created_at, 
            q.subjective_answer, 
            q.category_id,
            c.name
        FROM ${TABLES.QUESTIONS} q
            JOIN ${TABLES.CATEGORIES} c ON q.category_id = c.id
                WHERE 1=1
                    AND q.category_id IN (?)
        ORDER BY RAND()
            LIMIT (?)
    `,

    GET_ALL_CHOICES: `
        SELECT * FROM ${TABLES.CHOICES}
    `,
    
    GET_CHOICES_BY_QUESTIONS_IDS: `
        SELECT * FROM ${TABLES.CHOICES}
            WHERE question_id IN (?)
                ORDER BY id
    `,
} as const