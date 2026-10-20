import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import {
  closePool,
  seedFixtures,
  seedOverallPassRuleFixtures,
  seedPassRuleFixtures,
  truncateAll,
  type PassRuleSeedIds,
  type SeedIds,
} from './helpers/db';
import { userToken } from './helpers/auth';

const app = createApp();

describe('Exam API', () => {
  let seed: SeedIds;
  let passSeed: PassRuleSeedIds;
  let overallSeed: PassRuleSeedIds;

  beforeAll(async () => {
    await truncateAll();
    seed = await seedFixtures();
    passSeed = await seedPassRuleFixtures();
    overallSeed = await seedOverallPassRuleFixtures();
  });

  afterAll(async () => {
    await closePool();
  });

  describe('GET /api/quiz/quizzes', () => {
    it('mode=exam hides explanation, subjectiveAnswer, and isCorrect', async () => {
      const res = await request(app)
        .get('/api/quiz/quizzes')
        .query({
          categoryIds: String(seed.categoryId),
          track: 'test-track',
          mode: 'exam',
          quizLimit: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.mode).toBe('exam');
      expect(res.body.count).toBeGreaterThanOrEqual(1);

      for (const q of res.body.data as Array<Record<string, unknown>>) {
        expect(q).not.toHaveProperty('explanation');
        expect(q).not.toHaveProperty('subjectiveAnswer');
        const choices = q.choices as Array<Record<string, unknown>>;
        for (const c of choices) {
          expect(c).not.toHaveProperty('isCorrect');
          expect(c).toHaveProperty('choiceId');
          expect(c).toHaveProperty('choiceText');
        }
      }
    });

    it('practice mode includes explanation and isCorrect', async () => {
      const res = await request(app)
        .get('/api/quiz/quizzes')
        .query({
          categoryIds: String(seed.categoryId),
          track: 'test-track',
          quizLimit: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.mode).toBe('practice');

      const multiple = (res.body.data as Array<Record<string, any>>).find(
        (q) => q.questionId === seed.multipleQuestionId
      );
      expect(multiple).toBeDefined();
      if (!multiple) return;

      expect(multiple.explanation).toBe('basic arithmetic');
      expect(multiple.choices.some((c: { isCorrect: boolean }) => c.isCorrect)).toBe(true);
    });
  });

  describe('POST /api/quiz/exam/submit', () => {
    it('returns score and details; quizRecordId null without token', async () => {
      const res = await request(app)
        .post('/api/quiz/exam/submit')
        .send({
          trackId: seed.trackId,
          answers: [
            {
              questionId: seed.multipleQuestionId,
              choiceId: seed.correctChoiceId,
            },
            {
              questionId: seed.subjectiveQuestionId,
              subjectiveAnswer: 'Paris',
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.score).toBe(2);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.quizRecordId).toBeNull();
      expect(res.body.data.passed).toBeNull();
      expect(res.body.data.passRule).toBeNull();
      expect(res.body.data.average).toBe(100);
      expect(res.body.data.byCategory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            categoryId: seed.categoryId,
            correct: 2,
            total: 2,
            score: 100,
          }),
        ])
      );
      expect(res.body.data.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            questionId: seed.multipleQuestionId,
            isCorrect: true,
            correctChoiceIds: [seed.correctChoiceId],
          }),
          expect.objectContaining({
            questionId: seed.subjectiveQuestionId,
            isCorrect: true,
            subjectiveAnswer: 'Paris',
          }),
        ])
      );
    });

    it('persists quizRecordId when JWT is provided', async () => {
      const token = userToken({
        user_id: seed.userId,
        email: 'fixture@test.local',
        nickname: 'fixture-user',
      });

      const res = await request(app)
        .post('/api/quiz/exam/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          trackId: seed.trackId,
          answers: [
            {
              questionId: seed.multipleQuestionId,
              choiceId: seed.wrongChoiceId,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.score).toBe(0);
      expect(res.body.data.total).toBe(1);
      expect(typeof res.body.data.quizRecordId).toBe('number');
      expect(res.body.data.quizRecordId).toBeGreaterThan(0);
      expect(res.body.data.details[0].isCorrect).toBe(false);
    });

    it('returns 400 for bad body', async () => {
      const res = await request(app).post('/api/quiz/exam/submit').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/trackId and answers/);
    });

    it('passRule: passed true when all categories >= 40 and average >= 60', async () => {
      // CatA 1/2=50, CatB 2/2=100 → avg 75
      const res = await request(app)
        .post('/api/quiz/exam/submit')
        .send({
          trackId: passSeed.trackId,
          answers: [
            {
              questionId: passSeed.catA[0].questionId,
              choiceId: passSeed.catA[0].correctChoiceId,
            },
            {
              questionId: passSeed.catA[1].questionId,
              choiceId: passSeed.catA[1].wrongChoiceId,
            },
            {
              questionId: passSeed.catB[0].questionId,
              choiceId: passSeed.catB[0].correctChoiceId,
            },
            {
              questionId: passSeed.catB[1].questionId,
              choiceId: passSeed.catB[1].correctChoiceId,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.passRule).toEqual({
        minPerCategory: 40,
        minAverage: 60,
      });
      expect(res.body.data.average).toBe(75);
      expect(res.body.data.passed).toBe(true);
      expect(res.body.data.byCategory).toHaveLength(2);
    });

    it('passRule: passed false when a category is below 40', async () => {
      // CatA 0/2=0, CatB 2/2=100 → avg 50
      const res = await request(app)
        .post('/api/quiz/exam/submit')
        .send({
          trackId: passSeed.trackId,
          answers: [
            {
              questionId: passSeed.catA[0].questionId,
              choiceId: passSeed.catA[0].wrongChoiceId,
            },
            {
              questionId: passSeed.catA[1].questionId,
              choiceId: passSeed.catA[1].wrongChoiceId,
            },
            {
              questionId: passSeed.catB[0].questionId,
              choiceId: passSeed.catB[0].correctChoiceId,
            },
            {
              questionId: passSeed.catB[1].questionId,
              choiceId: passSeed.catB[1].correctChoiceId,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.passed).toBe(false);
      expect(res.body.data.byCategory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            categoryId: passSeed.categoryAId,
            score: 0,
          }),
        ])
      );
    });

    it('passRule minOverall: passed true when overall >= 75 and categories >= 40', async () => {
      // CatA 1/2=50, CatB 2/2=100 → overall 75
      const res = await request(app)
        .post('/api/quiz/exam/submit')
        .send({
          trackId: overallSeed.trackId,
          answers: [
            {
              questionId: overallSeed.catA[0].questionId,
              choiceId: overallSeed.catA[0].correctChoiceId,
            },
            {
              questionId: overallSeed.catA[1].questionId,
              choiceId: overallSeed.catA[1].wrongChoiceId,
            },
            {
              questionId: overallSeed.catB[0].questionId,
              choiceId: overallSeed.catB[0].correctChoiceId,
            },
            {
              questionId: overallSeed.catB[1].questionId,
              choiceId: overallSeed.catB[1].correctChoiceId,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.passRule).toEqual({
        minPerCategory: 40,
        minOverall: 75,
      });
      expect(res.body.data.overall).toBe(75);
      expect(res.body.data.passed).toBe(true);
    });

    it('passRule minOverall: passed false when overall < 75', async () => {
      // CatA 1/2=50, CatB 1/2=50 → overall 50
      const res = await request(app)
        .post('/api/quiz/exam/submit')
        .send({
          trackId: overallSeed.trackId,
          answers: [
            {
              questionId: overallSeed.catA[0].questionId,
              choiceId: overallSeed.catA[0].correctChoiceId,
            },
            {
              questionId: overallSeed.catA[1].questionId,
              choiceId: overallSeed.catA[1].wrongChoiceId,
            },
            {
              questionId: overallSeed.catB[0].questionId,
              choiceId: overallSeed.catB[0].correctChoiceId,
            },
            {
              questionId: overallSeed.catB[1].questionId,
              choiceId: overallSeed.catB[1].wrongChoiceId,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.overall).toBe(50);
      expect(res.body.data.passed).toBe(false);
    });
  });
});
