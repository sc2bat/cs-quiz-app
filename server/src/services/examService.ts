import { ResultSetHeader } from 'mysql2';
import { quizModel } from '../models/quizModel';
import { trackModel } from '../models/trackModel';
import { db } from '../config/db';
import { QUIZ_RECORD_QUERIES, ADMIN_QUERIES } from '../models/queries';
import { QUIZ_SETTINGS } from '../models/constants';

/** At least one of minAverage / minOverall must be set (with minPerCategory). */
type PassRule = {
  minPerCategory: number;
  minAverage?: number;
  minOverall?: number;
};

type CategoryScore = {
  categoryId: number;
  categoryName: string;
  correct: number;
  total: number;
  score: number;
};

function parseDefaults(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function parsePassRule(defaults: Record<string, unknown> | null): PassRule | null {
  const raw = defaults?.passRule;
  if (raw == null || typeof raw !== 'object') return null;
  const rule = raw as Record<string, unknown>;
  const minPerCategory = Number(rule.minPerCategory);
  if (!Number.isFinite(minPerCategory)) return null;

  const hasAverage = rule.minAverage != null && rule.minAverage !== '';
  const hasOverall = rule.minOverall != null && rule.minOverall !== '';
  const minAverage = hasAverage ? Number(rule.minAverage) : undefined;
  const minOverall = hasOverall ? Number(rule.minOverall) : undefined;
  if (hasAverage && !Number.isFinite(minAverage)) return null;
  if (hasOverall && !Number.isFinite(minOverall)) return null;
  if (minAverage == null && minOverall == null) return null;

  return {
    minPerCategory,
    ...(minAverage != null ? { minAverage } : {}),
    ...(minOverall != null ? { minOverall } : {}),
  };
}

function evaluatePass(
  passRule: PassRule,
  byCategory: CategoryScore[],
  average: number,
  overall: number
): boolean {
  if (byCategory.length === 0) return false;
  if (!byCategory.every((c) => c.score >= passRule.minPerCategory)) return false;
  if (passRule.minAverage != null && average < passRule.minAverage) return false;
  if (passRule.minOverall != null && overall < passRule.minOverall) return false;
  return true;
}

function buildCategoryScores(
  answers: { questionId: number }[],
  questions: Awaited<ReturnType<typeof quizModel.getQuestionsByIds>>,
  details: { questionId: number; isCorrect: boolean }[]
): CategoryScore[] {
  const byCat = new Map<
    number,
    { categoryName: string; correct: number; total: number }
  >();

  for (const answer of answers) {
    const question = questions.find((q) => q.question_id === answer.questionId);
    if (!question) continue;
    const detail = details.find((d) => d.questionId === answer.questionId);
    const existing = byCat.get(question.category_id) ?? {
      categoryName: question.category_name,
      correct: 0,
      total: 0,
    };
    existing.total += 1;
    if (detail?.isCorrect) existing.correct += 1;
    byCat.set(question.category_id, existing);
  }

  return [...byCat.entries()].map(([categoryId, row]) => ({
    categoryId,
    categoryName: row.categoryName,
    correct: row.correct,
    total: row.total,
    score: row.total === 0 ? 0 : Math.round((row.correct / row.total) * 100),
  }));
}

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

    const byCategory = buildCategoryScores(answers, questions, details);
    const average =
      byCategory.length === 0
        ? 0
        : Math.round(
            (byCategory.reduce((sum, c) => sum + c.score, 0) / byCategory.length) * 10
          ) / 10;
    const overall =
      answers.length === 0 ? 0 : Math.round((score / answers.length) * 100);

    const track = await trackModel.getTrackById(trackId);
    const passRule = parsePassRule(parseDefaults(track?.defaults ?? null));
    const passed =
      passRule == null
        ? null
        : evaluatePass(passRule, byCategory, average, overall);

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
      byCategory,
      average,
      overall,
      passed,
      passRule,
    };
  },
};
