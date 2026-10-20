import { pool, db } from '../../src/config/db';

/** Truncate domain tables (FK-safe order). Schema must already exist on the test DB. */
export async function truncateAll(): Promise<void> {
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.query('TRUNCATE TABLE quiz_submissions');
  await db.query('TRUNCATE TABLE quiz_record_categories');
  await db.query('TRUNCATE TABLE wrong_answers');
  await db.query('TRUNCATE TABLE quiz_records');
  await db.query('TRUNCATE TABLE choices');
  await db.query('TRUNCATE TABLE questions');
  await db.query('TRUNCATE TABLE categories');
  await db.query('TRUNCATE TABLE tracks');
  await db.query('TRUNCATE TABLE users');
  await db.query('SET FOREIGN_KEY_CHECKS = 1');
}

export type SeedIds = {
  trackId: number;
  categoryId: number;
  multipleQuestionId: number;
  correctChoiceId: number;
  wrongChoiceId: number;
  subjectiveQuestionId: number;
  userId: number;
};

export type PassRuleSeedIds = {
  trackId: number;
  categoryAId: number;
  categoryBId: number;
  /** category A: 2 MULTIPLE questions */
  catA: { questionId: number; correctChoiceId: number; wrongChoiceId: number }[];
  /** category B: 2 MULTIPLE questions */
  catB: { questionId: number; correctChoiceId: number; wrongChoiceId: number }[];
};

async function insertMultipleQuestion(
  categoryId: number,
  text: string
): Promise<{ questionId: number; correctChoiceId: number; wrongChoiceId: number }> {
  const q = await db.execute(
    `INSERT INTO questions
       (category_id, question_type, question_text, explanation, is_active)
     VALUES (?, 'MULTIPLE', ?, ?, 1)`,
    [categoryId, text, 'fixture']
  );
  const questionId = q.insertId;
  const correct = await db.execute(
    `INSERT INTO choices (question_id, choice_text, is_correct, sort_order)
     VALUES (?, ?, 1, 0)`,
    [questionId, 'correct']
  );
  const wrong = await db.execute(
    `INSERT INTO choices (question_id, choice_text, is_correct, sort_order)
     VALUES (?, ?, 0, 1)`,
    [questionId, 'wrong']
  );
  return {
    questionId,
    correctChoiceId: correct.insertId,
    wrongChoiceId: wrong.insertId,
  };
}

/** Minimal fixtures for tracks / exam / admin suites. */
export async function seedFixtures(): Promise<SeedIds> {
  const track = await db.execute(
    `INSERT INTO tracks (slug, name, description, is_active)
     VALUES (?, ?, ?, 1)`,
    ['test-track', 'Test Track', 'fixture track']
  );
  const trackId = track.insertId;

  const category = await db.execute(
    `INSERT INTO categories (track_id, name, sort_order)
     VALUES (?, ?, 0)`,
    [trackId, 'Test Category']
  );
  const categoryId = category.insertId;

  const multiple = await db.execute(
    `INSERT INTO questions
       (category_id, question_type, question_text, explanation, is_active)
     VALUES (?, 'MULTIPLE', ?, ?, 1)`,
    [categoryId, '2 + 2 = ?', 'basic arithmetic']
  );
  const multipleQuestionId = multiple.insertId;

  const correct = await db.execute(
    `INSERT INTO choices (question_id, choice_text, is_correct, sort_order)
     VALUES (?, ?, 1, 0)`,
    [multipleQuestionId, '4']
  );
  const wrong = await db.execute(
    `INSERT INTO choices (question_id, choice_text, is_correct, sort_order)
     VALUES (?, ?, 0, 1)`,
    [multipleQuestionId, '5']
  );

  const subjective = await db.execute(
    `INSERT INTO questions
       (category_id, question_type, question_text, explanation, subjective_answer, is_active)
     VALUES (?, 'SUBJECTIVE', ?, ?, ?, 1)`,
    [categoryId, 'Capital of France?', 'geography', 'Paris']
  );

  const user = await db.execute(
    `INSERT INTO users (email, nickname, provider, sns_id, user_role)
     VALUES (?, ?, ?, ?, ?)`,
    ['fixture@test.local', 'fixture-user', 'test', 'sns-fixture-1', 'USER']
  );

  return {
    trackId,
    categoryId,
    multipleQuestionId,
    correctChoiceId: correct.insertId,
    wrongChoiceId: wrong.insertId,
    subjectiveQuestionId: subjective.insertId,
    userId: user.insertId,
  };
}

async function seedTwoCategoryPassTrack(
  slug: string,
  name: string,
  passRule: { minPerCategory: number; minAverage?: number; minOverall?: number }
): Promise<PassRuleSeedIds> {
  const defaults = JSON.stringify({
    questionLimit: 10,
    secondsPerQuestion: 30,
    passRule,
  });
  const track = await db.execute(
    `INSERT INTO tracks (slug, name, description, defaults, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [slug, name, 'passRule fixture', defaults]
  );
  const trackId = track.insertId;

  const catA = await db.execute(
    `INSERT INTO categories (track_id, name, sort_order) VALUES (?, ?, 0)`,
    [trackId, 'Subject A']
  );
  const catB = await db.execute(
    `INSERT INTO categories (track_id, name, sort_order) VALUES (?, ?, 1)`,
    [trackId, 'Subject B']
  );

  return {
    trackId,
    categoryAId: catA.insertId,
    categoryBId: catB.insertId,
    catA: [
      await insertMultipleQuestion(catA.insertId, `${slug}-A1?`),
      await insertMultipleQuestion(catA.insertId, `${slug}-A2?`),
    ],
    catB: [
      await insertMultipleQuestion(catB.insertId, `${slug}-B1?`),
      await insertMultipleQuestion(catB.insertId, `${slug}-B2?`),
    ],
  };
}

/** IPE-style: minPerCategory 40 + minAverage 60 */
export async function seedPassRuleFixtures(): Promise<PassRuleSeedIds> {
  return seedTwoCategoryPassTrack('ipe-pass-track', 'IPE Pass Track', {
    minPerCategory: 40,
    minAverage: 60,
  });
}

/** SQLP-style: minPerCategory 40 + minOverall 75 */
export async function seedOverallPassRuleFixtures(): Promise<PassRuleSeedIds> {
  return seedTwoCategoryPassTrack('sqlp-pass-track', 'SQLP Pass Track', {
    minPerCategory: 40,
    minOverall: 75,
  });
}

export async function closePool(): Promise<void> {
  await pool.end();
}
