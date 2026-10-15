import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { closePool } from './helpers/db';

const app = createApp();

describe('API test harness smoke', () => {
  afterAll(async () => {
    await closePool();
  });

  it('GET / returns welcome payload', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/CS Quiz Server/);
  });
});
