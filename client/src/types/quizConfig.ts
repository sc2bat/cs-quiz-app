export interface QuizConfig {
    limit: number;
    categoryIds: number[];
}

export type AppMode = 'SETUP' | 'PLAYING' | 'RESULT';