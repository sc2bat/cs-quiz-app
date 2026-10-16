import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { closePool, seedFixtures, truncateAll, type SeedIds } from './helpers/db';

const app = createApp();

describe('Tracks API', () => {
  let seed: SeedIds;

  beforeAll(async () => {
    await truncateAll();
    seed = await seedFixtures();
  });

  afterAll(async () => {
    await closePool();
  });

  it('GET /api/tracks returns seeded track slug', async () => {
    const res = await request(app).get('/api/tracks');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.count).toBeGreaterThanOrEqual(1);

    const slugs = (res.body.data as Array<{ slug: string }>).map((t) => t.slug);
    expect(slugs).toContain('test-track');
  });

  it('GET /api/tracks/:slug/categories returns 200 with categories', async () => {
    const res = await request(app).get('/api/tracks/test-track/categories');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.track.slug).toBe('test-track');
    expect(res.body.data.track.trackId).toBe(seed.trackId);
    expect(res.body.data.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          categoryId: seed.categoryId,
          trackId: seed.trackId,
          name: 'Test Category',
        }),
      ])
    );
  });

  it('GET /api/tracks/:slug/categories returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/tracks/no-such-track/categories');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Track not found.');
  });
});
