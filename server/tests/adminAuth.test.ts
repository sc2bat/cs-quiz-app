import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, seedFixtures, truncateAll } from './helpers/db';
import { adminToken, userToken } from './helpers/auth';

const app = createApp();

describe('Admin auth gate — GET /api/admin/tracks', () => {
  beforeAll(async () => {
    await truncateAll();
    await seedFixtures();
  });

  afterAll(async () => {
    await closePool();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/tracks');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Access token required');
  });

  it('returns 403 for invalid token', async () => {
    const res = await request(app)
      .get('/api/admin/tracks')
      .set('Authorization', 'Bearer not-a-valid-jwt');

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/token/i);
  });

  it('returns 403 for USER role', async () => {
    const res = await request(app)
      .get('/api/admin/tracks')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Admin access required');
  });

  it('returns 200 for ADMIN role', async () => {
    const res = await request(app)
      .get('/api/admin/tracks')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((t: { slug: string }) => t.slug === 'test-track')).toBe(true);
  });
});
