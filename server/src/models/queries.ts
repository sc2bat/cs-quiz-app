import { TABLES } from "./constants";

export const COMMON_QUERIES = {
    GET_NOW:`
        SELECT NOW() as now
    `,

    GET_SELECT_ONE:`
        SELECT 1
    `,
} as const;

export const QUIZ_QUERIES = {
    // category
    GET_ALL_CATEGORIES: `
        SELECT * FROM ${TABLES.CATEGORIES}
    `,

    // question
    GET_ALL_RANDOM_QUESTIONS: `
        SELECT * FROM ${TABLES.QUESTIONS}
            ORDER BY RAND()
    `,

    GET_RANDOM_QUESTIONS_BY_CATEGORY_IDS: `
        SELECT 
            q.id, 
            q.question_type, 
            q.question_text, 
            q.explanation, 
            q.created_at, 
            q.subjective_answer, 
            q.category_id,
            c.name AS category_name
        FROM ${TABLES.QUESTIONS} q
            JOIN ${TABLES.CATEGORIES} c ON q.category_id = c.id
                WHERE 1=1
                    AND q.category_id IN (?)
        ORDER BY RAND()
            LIMIT ?
    `,

    // choices
    GET_ALL_CHOICES: `
        SELECT * FROM ${TABLES.CHOICES}
    `,
    
    GET_CHOICES_BY_QUESTIONS_IDS: `
        SELECT * FROM ${TABLES.CHOICES}
            WHERE question_id IN (?)
                ORDER BY id
    `,
} as const