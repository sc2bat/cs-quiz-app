export interface Choice {
  choiceId: number;
  choiceText: string;
  isCorrect?: boolean;
}

export interface Question {
  questionId: number;
  categoryId: number;
  categoryName: string;
  type: string;
  question: string;
  explanation: string;
  subjectiveAnswer?: string;
  choices: Choice[];
}

export interface ApiResponse {
  status: string;
  data: Question[];
}

export interface Category {
  categoryId: number;
  trackId: number;
  name: string;
}
