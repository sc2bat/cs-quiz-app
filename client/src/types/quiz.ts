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