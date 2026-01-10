export interface Choice {
  choiceId: number;
  choiceText: string;
  isCorrect: boolean;
}

export interface Question {
  questionId: number;
  categoryId: string;
  categoryName: string;
  type: string;
  question: string;
  explanation: string;
  subjectiveAnswer?: string;
  choices: Choice[];
}

export interface ApiResponse {
  status: string;
  questionRow: Question[];
}

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface QuizRecordPayload {
  categoryId: number;
  score: number;
  totalQuestions: number;
}

export interface QuizHistoryItem {
  quiz_record_id: number;
  category_name?: string;
  score: number;
  total_questions: number;
  created_at: string;
}