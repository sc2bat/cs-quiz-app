export interface Choice {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  category: string;
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