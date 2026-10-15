import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, seedFixtures, truncateAll, type SeedIds } from './helpers/db';
import { userToken } from './helpers/auth';

const app = createApp();

describe('Exam API', () => {
  let seed: SeedIds;

  beforeAll(async () => {
    await truncateAll();
    seed = await seedFixtures();
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
  });
});
