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
            q.question_id, 
            q.question_type, 
            q.question_text, 
            q.explanation, 
            q.created_at, 
            q.subjective_answer, 
            q.category_id,
            c.name AS category_name
        FROM ${TABLES.QUESTIONS} q
            JOIN ${TABLES.CATEGORIES} c ON q.category_id = c.category_id
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
                ORDER BY choice_id
    `,
} as const

export const USER_QUERIES = {
    GET_USER_BY_SNS_ID: `
    SELECT 
        user_id, 
        email, 
        nickname, 
        profile_image_url, 
        provider, 
        sns_id, 
        user_role, 
        refresh_token, 
        last_login_at, 
        created_at
    FROM ${TABLES.USERS}
        WHERE 1=1
            AND provider = ?
            AND sns_id = ?
    `,
    GET_USER_BY_USER_ID: `
    SELECT 
        user_id, 
        email, 
        nickname, 
        profile_image_url, 
        provider, 
        sns_id, 
        user_role, 
        refresh_token, 
        last_login_at, 
        created_at
    FROM ${TABLES.USERS}
        WHERE 1=1
            AND user_id = ?
    `,
    CREATE_USER: `
        INSERT INTO ${TABLES.USERS} (
            email, 
            nickname, 
            profile_image_url, 
            provider, 
            sns_id, 
            user_role, 
            refresh_token, 
            last_login_at, 
            created_at
            )
        VALUES(
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            ?, 
            NULL, 
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP
        )
    `,
    UPDATE_USER_LOGIN_INFO: `
        UPDATE cs_quiz.users
            SET 
                profile_image_url=?, 
                last_login_at=CURRENT_TIMESTAMP
                WHERE 1=1
                    AND provider=? 
                    AND sns_id=?
    `,
}

export const QUIZ_RECORD_QUERIES = {
    CREATE_QUIZ_RECORD: `
        INSERT INTO ${TABLES.QUIZ_RECORDS} (
            user_id, 
            category_id, 
            score, 
            total_questions, 
            taken_at
            )
        VALUES(
            ?, 
            ?, 
            ?, 
            ?,
            CURRENT_TIMESTAMP
        )
    `,
} as const;