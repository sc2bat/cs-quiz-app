import { ResultSetHeader } from 'mysql2';
import { quizModel } from '../models/quizModel';
import { trackModel } from '../models/trackModel';
import { db } from '../config/db';
import { QUIZ_RECORD_QUERIES, ADMIN_QUERIES } from '../models/queries';
import { QUIZ_SETTINGS } from '../models/constants';

function toExamPayload(
  questions: Awaited<ReturnType<typeof quizModel.getQuestionsByCategoryIds>>,
  choices: Awaited<ReturnType<typeof quizModel.getChoicesByQuestionsIds>>
) {
  return questions.map((question) => {
    const related = choices.filter((c) => c.question_id === question.question_id);
    return {
      questionId: question.question_id,
      categoryId: question.category_id,
      categoryName: question.category_name,
      type: question.question_type,
      question: question.question_text,
      // no explanation / subjectiveAnswer / isCorrect in exam mode
      choices: related.map((choice) => ({
        choiceId: choice.choice_id,
        choiceText: choice.choice_text,
      })),
    };
  });
}

export const examService = {
  async getExamQuizzes(
    categoryIds: number[],
    quizLimit: number = QUIZ_SETTINGS.DEFAULT_QUESTION_COUNT,
    trackSlug?: string
  ) {
    if (!categoryIds.length) return [];

    let questions;
    if (trackSlug) {
      const track = await trackModel.getTrackBySlug(trackSlug);
      if (!track) return null;
      questions = await quizModel.getQuestionsByTrackAndCategoryIds(
        track.track_id,
        categoryIds,
        quizLimit
      );
    } else {
      questions = await quizModel.getQuestionsByCategoryIds(categoryIds, quizLimit);
    }

    if (!questions.length) return [];
    const ids = questions.map((q) => q.question_id);
    const choices = await quizModel.getChoicesByQuestionsIds(ids);
    return toExamPayload(questions, choices);
  },

  async submitExam(dto: {
    userId?: number;
    trackId: number;
    answers: {
      questionId: number;
      choiceId?: number | null;
      subjectiveAnswer?: string | null;
    }[];
  }) {
    const { trackId, answers, userId } = dto;
    if (!answers.length) {
      throw Object.assign(new Error('answers required'), { status: 400 });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await quizModel.getQuestionsByIds(questionIds);
    const choices = await quizModel.getChoicesByQuestionsIds(questionIds);

    let score = 0;
    const details: {
      questionId: number;
      isCorrect: boolean;
      explanation: string | null;
      correctChoiceIds: number[];
      subjectiveAnswer: string | null;
    }[] = [];

    for (const answer of answers) {
      const question = questions.find((q) => q.question_id === answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      const qChoices = choices.filter((c) => c.question_id === answer.questionId);
      const correctChoiceIds = qChoices
        .filter((c) => c.is_correct)
        .map((c) => c.choice_id);

      if (question.question_type === 'MULTIPLE') {
        isCorrect = Boolean(
          answer.choiceId && correctChoiceIds.includes(Number(answer.choiceId))
        );
      } else {
        const expected = (question.subjective_answer || '').trim();
        const given = (answer.subjectiveAnswer || '').trim();
        isCorrect = expected.length > 0 && expected === given;
      }

      if (isCorrect) score += 1;
      details.push({
        questionId: question.question_id,
        isCorrect,
        explanation: question.explanation,
        correctChoiceIds,
        subjectiveAnswer: question.subjective_answer,
      });
    }

    let quizRecordId: number | null = null;
    if (userId) {
      quizRecordId = await db.transaction(async (conn) => {
        const [recordResult] = await conn.execute<ResultSetHeader>(
          QUIZ_RECORD_QUERIES.CREATE_QUIZ_RECORD,
          [userId, trackId, score, answers.length]
        );
        const recordId = recordResult.insertId;

        for (const answer of answers) {
          const detail = details.find((d) => d.questionId === answer.questionId);
          await conn.execute(ADMIN_QUERIES.CREATE_QUIZ_SUBMISSION, [
            recordId,
            answer.questionId,
            answer.choiceId ?? null,
            answer.subjectiveAnswer ?? null,
            detail?.isCorrect ? 1 : 0,
          ]);
        }
        return recordId;
      });
    }

    return {
      score,
      total: answers.length,
      quizRecordId,
      details,
    };
  },
};
