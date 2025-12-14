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
  id: number;
  name: string;
}