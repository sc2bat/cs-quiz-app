export const TABLES ={
    CATEGORIES: 'categories',
    CHOICES: 'choices',
    QUESTIONS: 'questions',
    QUIZ_RECORDS: 'quiz_records',
    QUIZ_SUBMISSIONS: 'quiz_submissions',
    USERS: 'users',
} as const;

export const QUIZ_SETTINGS = {
    DEFAULT_QUESTION_COUNT: 10,
    // DEFAULT_QUESTION_TIMER: 30,
    DEFAULT_USER_ROLE: 'USER',
    ADMIN_USER_ROLE: 'ADMIN'
} as const;