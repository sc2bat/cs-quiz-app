export interface Choice {
  choiceId: number;
  choiceText: string;
  isCorrect: boolean;
}

export interface Question {
  questionId: number;
  categoryId: string;
  categoryName: string;
  questionType: string;
  questionText: string;
  explanation: string;
  subjectiveAnswer?: string;
  choices: Choice[];
}

export interface ApiResponse {
  status: string;
  data: Question[];
}
