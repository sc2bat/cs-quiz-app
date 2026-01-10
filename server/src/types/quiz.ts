import { RowDataPacket } from "mysql2";

export interface QuestionRow extends RowDataPacket {
  question_id: number;
  category_id: number;
  category_name: string;
  question_type: string;
  question_text: string;
  explanation: string;
  subjective_answer: string;
}

export interface ChoiceRow extends RowDataPacket {
  choice_id: number;
  question_id: number;
  choice_text: string;
  is_correct: number;
}

export interface CategoryRow extends RowDataPacket{
  category_id: number;
  category_name: string;
}

export interface QuizRecordRow extends RowDataPacket{
  quiz_record_id: number;
  user_id: number;
  category_id: number;
  score: number;
  total_questions: number;
  taken_at: Date;
}

export type CreateQuizRecordDto = Pick<
  QuizRecordRow, 
  'user_id' | 'category_id' | 'score' | 'user_id' | 'total_questions'
>; 