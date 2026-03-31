import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildApp } from '../../src/app.js';

vi.mock('../../src/db/connection.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
  },
  pool: { end: vi.fn() },
  runMigrations: vi.fn(),
}));

import { db } from '../../src/db/connection.js';

const mockedDb = db as unknown as {
  execute: ReturnType<typeof vi.fn>;
};

describe('Health Routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it('returns 200 with status ok when database is reachable', async () => {
    mockedDb.execute.mockResolvedValue([{ '?column?': 1 }]);

    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('returns 503 when database is unreachable', async () => {
    mockedDb.execute.mockRejectedValue(new Error('Connection refused'));

    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: 'unhealthy',
      error: 'Database unreachable',
    });
  });
});
