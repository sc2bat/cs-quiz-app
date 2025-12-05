export const QUERIES = {
    GET_ALL_QUESTIONS: `
        SELECT * FROM questions
            ORDER BY RAND()
    `,
    GET_ALL_CHOICES: `
        SELECT * FROM choices
    `,

} as const