import { TABLES } from "./constants";

export const COMMON_QUERIES = {
    GET_NOW:`
        SELECT NOW() as now
    `,

    GET_SELECT_ONE:`
        SELECT 1
    `,
} as const;

export const TRACK_QUERIES = {
    GET_ACTIVE_TRACKS: `
        SELECT track_id, slug, name, description, defaults, is_active
        FROM ${TABLES.TRACKS}
            WHERE is_active = 1
        ORDER BY track_id
    `,
    GET_TRACK_BY_SLUG: `
        SELECT track_id, slug, name, description, defaults, is_active
        FROM ${TABLES.TRACKS}
            WHERE slug = ?
            LIMIT 1
    `,
} as const;

export const QUIZ_QUERIES = {
    GET_ALL_CATEGORIES: `
        SELECT category_id, track_id, name, sort_order
        FROM ${TABLES.CATEGORIES}
        ORDER BY sort_order, category_id
    `,

    GET_CATEGORIES_BY_TRACK_ID: `
        SELECT category_id, track_id, name, sort_order
        FROM ${TABLES.CATEGORIES}
            WHERE track_id = ?
        ORDER BY sort_order, category_id
    `,

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

    GET_RANDOM_QUESTIONS_BY_TRACK_AND_CATEGORY_IDS: `
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
                WHERE c.track_id = ?
                    AND q.category_id IN (?)
        ORDER BY RAND()
            LIMIT ?
    `,

    GET_ALL_CHOICES: `
        SELECT * FROM ${TABLES.CHOICES}
    `,

    GET_CHOICES_BY_QUESTIONS_IDS: `
        SELECT * FROM ${TABLES.CHOICES}
            WHERE question_id IN (?)
                ORDER BY choice_id
    `,

    GET_QUESTIONS_BY_IDS: `
        SELECT
            q.question_id,
            q.question_type,
            q.question_text,
            q.explanation,
            q.created_at,
            q.subjective_answer,
            q.category_id,
            c.name AS category_name,
            c.track_id
        FROM ${TABLES.QUESTIONS} q
            JOIN ${TABLES.CATEGORIES} c ON q.category_id = c.category_id
                WHERE q.question_id IN (?)
    `,
} as const;

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
        UPDATE ${TABLES.USERS}
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
            track_id,
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
    GET_ALL_QUIZ_RECORDS: `
        SELECT
            quiz_record_id,
            user_id,
            track_id,
            score,
            total_questions,
            taken_at
        FROM ${TABLES.QUIZ_RECORDS}
            WHERE user_id = ?
    `,
    GET_RECENT_QUIZ_RECORDS: `
        SELECT
            quiz_record_id,
            user_id,
            track_id,
            score,
            total_questions,
            taken_at
        FROM ${TABLES.QUIZ_RECORDS}
            WHERE user_id = ?
            ORDER BY taken_at DESC, quiz_record_id DESC
            LIMIT ?
    `,
    GET_QUIZ_RECORDS_BY_CURSOR: `
        SELECT
            quiz_record_id,
            user_id,
            track_id,
            score,
            total_questions,
            taken_at
        FROM ${TABLES.QUIZ_RECORDS}
            WHERE user_id = ?
                AND (
                    taken_at < ?
                    OR (taken_at = ? AND quiz_record_id < ?)
                )
            ORDER BY taken_at DESC, quiz_record_id DESC
            LIMIT ?
    `,
    DELETE_QUIZ_RECORDS: `
        DELETE FROM ${TABLES.QUIZ_RECORDS}
            WHERE 1=1
                AND user_id = ?
                AND quiz_record_id = ?
    `,
    GET_QUIZ_RECORDS_BY_TRACK: `
        SELECT
            quiz_record_id,
            user_id,
            track_id,
            score,
            total_questions,
            taken_at
        FROM ${TABLES.QUIZ_RECORDS}
            WHERE user_id = ?
                AND track_id = ?
            ORDER BY taken_at DESC, quiz_record_id DESC
            LIMIT ?
    `,
} as const;

export const WRONG_ANSWER_QUERIES = {
    UPSERT_WRONG_ANSWER: `
        INSERT INTO ${TABLES.WRONG_ANSWERS} (user_id, track_id, question_id, wrong_count, last_wrong_at)
        VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
            wrong_count = wrong_count + 1,
            last_wrong_at = CURRENT_TIMESTAMP
    `,
    GET_WRONG_ANSWERS_BY_TRACK: `
        SELECT user_id, track_id, question_id, wrong_count, last_wrong_at
        FROM ${TABLES.WRONG_ANSWERS}
            WHERE user_id = ?
                AND track_id = ?
        ORDER BY last_wrong_at DESC
    `,
    GET_ALL_WRONG_ANSWERS: `
        SELECT user_id, track_id, question_id, wrong_count, last_wrong_at
        FROM ${TABLES.WRONG_ANSWERS}
            WHERE user_id = ?
        ORDER BY last_wrong_at DESC
    `,
    DELETE_WRONG_ANSWER: `
        DELETE FROM ${TABLES.WRONG_ANSWERS}
            WHERE user_id = ?
                AND track_id = ?
                AND question_id = ?
    `,
    CLEAR_WRONG_ANSWERS_BY_TRACK: `
        DELETE FROM ${TABLES.WRONG_ANSWERS}
            WHERE user_id = ?
                AND track_id = ?
    `,
} as const;

export const ADMIN_QUERIES = {
    GET_ALL_TRACKS: `
        SELECT track_id, slug, name, description, defaults, is_active, created_at, updated_at
        FROM ${TABLES.TRACKS}
        ORDER BY track_id
    `,
    CREATE_TRACK: `
        INSERT INTO ${TABLES.TRACKS} (slug, name, description, defaults, is_active)
        VALUES (?, ?, ?, ?, ?)
    `,
    UPDATE_TRACK: `
        UPDATE ${TABLES.TRACKS}
        SET slug = ?, name = ?, description = ?, defaults = ?, is_active = ?
        WHERE track_id = ?
    `,
    DELETE_TRACK: `
        DELETE FROM ${TABLES.TRACKS} WHERE track_id = ?
    `,
    CREATE_CATEGORY: `
        INSERT INTO ${TABLES.CATEGORIES} (track_id, name, sort_order)
        VALUES (?, ?, ?)
    `,
    UPDATE_CATEGORY: `
        UPDATE ${TABLES.CATEGORIES}
        SET track_id = ?, name = ?, sort_order = ?
        WHERE category_id = ?
    `,
    DELETE_CATEGORY: `
        DELETE FROM ${TABLES.CATEGORIES} WHERE category_id = ?
    `,
    GET_QUESTIONS_BY_CATEGORY: `
        SELECT question_id, category_id, question_type, question_text, explanation, subjective_answer, created_at
        FROM ${TABLES.QUESTIONS}
        WHERE category_id = ?
        ORDER BY question_id DESC
    `,
    CREATE_QUESTION: `
        INSERT INTO ${TABLES.QUESTIONS}
            (category_id, question_type, question_text, explanation, subjective_answer)
        VALUES (?, ?, ?, ?, ?)
    `,
    UPDATE_QUESTION: `
        UPDATE ${TABLES.QUESTIONS}
        SET category_id = ?, question_type = ?, question_text = ?, explanation = ?, subjective_answer = ?
        WHERE question_id = ?
    `,
    DELETE_QUESTION: `
        DELETE FROM ${TABLES.QUESTIONS} WHERE question_id = ?
    `,
    CREATE_CHOICE: `
        INSERT INTO ${TABLES.CHOICES} (question_id, choice_text, is_correct, sort_order)
        VALUES (?, ?, ?, ?)
    `,
    DELETE_CHOICES_BY_QUESTION: `
        DELETE FROM ${TABLES.CHOICES} WHERE question_id = ?
    `,
    GET_QUESTION_WITH_ANSWER: `
        SELECT question_id, category_id, question_type, question_text, explanation, subjective_answer
        FROM ${TABLES.QUESTIONS}
        WHERE question_id = ?
        LIMIT 1
    `,
    CREATE_QUIZ_SUBMISSION: `
        INSERT INTO ${TABLES.QUIZ_SUBMISSIONS}
            (quiz_record_id, question_id, choice_id, subjective_answer, is_correct, answered_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
} as const;
