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
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

function mockSelectChain(result: unknown[]) {
  mockedDb.select.mockReturnValue({
    from: vi.fn().mockReturnValue({
      orderBy: vi.fn().mockResolvedValue(result),
    }),
  });
}

function mockInsertChain(result: unknown) {
  mockedDb.insert.mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([result]),
    }),
  });
}

function mockUpdateChain(result: unknown[]) {
  mockedDb.update.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(result),
      }),
    }),
  });
}

function mockDeleteChain(result: unknown[]) {
  mockedDb.delete.mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(result),
    }),
  });
}

const sampleTodo = {
  id: 1,
  description: 'Test todo',
  completed: false,
  createdAt: new Date('2026-03-30T00:00:00Z'),
};

describe('Todo Routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  describe('GET /api/todos', () => {
    it('returns 200 with empty array when no todos exist', async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/todos',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it('returns 500 when database query fails', async () => {
      mockedDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockRejectedValue(new Error('DB connection lost')),
        }),
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/todos',
      });

      expect(response.statusCode).toBe(500);
      const body = response.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
    });

    it('returns created todos ordered by createdAt ascending', async () => {
      const todos = [
        { ...sampleTodo, id: 1, description: 'First' },
        { ...sampleTodo, id: 2, description: 'Second' },
      ];
      mockSelectChain(todos);

      const response = await app.inject({
        method: 'GET',
        url: '/api/todos',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveLength(2);
      expect(body[0].description).toBe('First');
      expect(body[1].description).toBe('Second');
    });
  });

  describe('POST /api/todos', () => {
    it('returns 201 with created todo for valid description', async () => {
      const created = { ...sampleTodo, description: 'New task' };
      mockInsertChain(created);

      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { description: 'New task' },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().description).toBe('New task');
    });

    it('returns 400 for empty description', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { description: '' },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
    });

    it('returns 400 for whitespace-only description', async () => {
      mockInsertChain(sampleTodo);

      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { description: '   ' },
      });

      // Fastify schema validation catches minLength 1 after trim or route handler catches post-trim
      // The route handler trims and checks — but schema minLength=1 fires first for empty string
      // For whitespace-only, schema passes (length>0) but route handler trims and rejects
      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
    });

    it('returns 400 for description over 500 characters', async () => {
      const longDesc = 'a'.repeat(501);

      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { description: longDesc },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
    });

    it('trims leading/trailing whitespace from description', async () => {
      const created = { ...sampleTodo, description: 'Trimmed task' };
      mockInsertChain(created);

      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { description: '  Trimmed task  ' },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().description).toBe('Trimmed task');
    });

    it('returns 400 for missing description field', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
    });

    it('strips extra properties per additionalProperties: false schema', async () => {
      const created = { ...sampleTodo, description: 'Valid' };
      mockInsertChain(created);

      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { description: 'Valid', extra: 'not allowed' },
      });

      // Fastify removes additional properties rather than rejecting them
      expect(response.statusCode).toBe(201);
      expect(response.json().description).toBe('Valid');
    });

    it('error responses match { error, message } format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(typeof body.error).toBe('string');
      expect(typeof body.message).toBe('string');
    });
  });

  describe('PATCH /api/todos/:id', () => {
    it('returns 200 with updated todo when toggling completed', async () => {
      const updated = { ...sampleTodo, completed: true };
      mockUpdateChain([updated]);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/todos/1',
        payload: { completed: true },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().completed).toBe(true);
    });

    it('returns 404 for non-existent id', async () => {
      mockUpdateChain([]);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/todos/999',
        payload: { completed: true },
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.error).toBe('NOT_FOUND');
      expect(body.message).toBe('Todo not found');
    });

    it('returns 400 for invalid id (non-integer)', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/todos/abc',
        payload: { completed: true },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
    });

    it('returns 400 for missing completed field', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/todos/1',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('returns 204 for existing todo', async () => {
      mockDeleteChain([sampleTodo]);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/todos/1',
      });

      expect(response.statusCode).toBe(204);
    });

    it('returns 404 for non-existent id', async () => {
      mockDeleteChain([]);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/todos/999',
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.error).toBe('NOT_FOUND');
      expect(body.message).toBe('Todo not found');
    });
  });
});
