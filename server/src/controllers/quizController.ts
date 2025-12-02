import { Request, Response } from 'express';
import { db } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface QuestionRow extends RowDataPacket {
  id: number;
  category: string;
  question_type: string;
  question_text: string;
  explanation: string;
}

interface ChoiceRow extends RowDataPacket {
  id: number;
  question_id: number;
  choice_text: string;
  is_correct: boolean;
}

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    // 1. 모든 문제 가져오기 (랜덤으로 섞어서)
    const [questions] = await db.query<QuestionRow[]>('SELECT * FROM questions ORDER BY RAND()');

    if (questions.length === 0) {
      return res.status(404).json({ message: '등록된 문제가 없습니다.' });
    }

    // 2. 모든 보기 가져오기
    const [choices] = await db.query<ChoiceRow[]>('SELECT * FROM choices');

    // 3. 문제와 보기를 합치기 (Data Mapping)
    const data = questions.map((q) => {
      // 현재 문제 ID에 해당하는 보기만 필터링
      const relatedChoices = choices.filter((c) => c.question_id === q.id);
      
      return {
        id: q.id,
        category: q.category,
        type: q.question_type, 
        question: q.question_text,
        explanation: q.explanation,
        // 주관식은 보기가 없으므로 빈 배열일 수 있음
        choices: relatedChoices.map((c) => ({
          id: c.id,
          text: c.choice_text,
          isCorrect: Boolean(c.is_correct) // 0/1을 true/false로 변환
        }))
      };
    });

    // 4. 성공 응답 보내기
    res.json({
      status: 'success',
      count: data.length,
      data: data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
};