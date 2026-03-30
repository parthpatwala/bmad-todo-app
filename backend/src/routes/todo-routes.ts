import type { FastifyInstance } from 'fastify';
import { eq, asc } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { todos } from '../db/schema.js';

const paramsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer', minimum: 1 },
  },
} as const;

const createBodySchema = {
  type: 'object',
  required: ['description'],
  properties: {
    description: { type: 'string', minLength: 1, maxLength: 500 },
  },
  additionalProperties: false,
} as const;

const updateBodySchema = {
  type: 'object',
  required: ['completed'],
  properties: {
    completed: { type: 'boolean' },
  },
  additionalProperties: false,
} as const;

export async function todoRoutes(app: FastifyInstance) {
  app.get('/api/todos', async () => {
    return db.select().from(todos).orderBy(asc(todos.createdAt));
  });

  app.post<{ Body: { description: string } }>('/api/todos', {
    schema: { body: createBodySchema },
  }, async (request, reply) => {
    const description = request.body.description.trim();

    if (description.length === 0) {
      reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: 'Description cannot be empty',
      });
      return;
    }

    const [created] = await db.insert(todos)
      .values({ description })
      .returning();

    reply.status(201).send(created);
  });

  app.patch<{ Params: { id: number }; Body: { completed: boolean } }>('/api/todos/:id', {
    schema: { params: paramsSchema, body: updateBodySchema },
  }, async (request, reply) => {
    const [updated] = await db.update(todos)
      .set({ completed: request.body.completed })
      .where(eq(todos.id, request.params.id))
      .returning();

    if (!updated) {
      reply.status(404).send({ error: 'NOT_FOUND', message: 'Todo not found' });
      return;
    }

    return updated;
  });

  app.delete<{ Params: { id: number } }>('/api/todos/:id', {
    schema: { params: paramsSchema },
  }, async (request, reply) => {
    const [deleted] = await db.delete(todos)
      .where(eq(todos.id, request.params.id))
      .returning();

    if (!deleted) {
      reply.status(404).send({ error: 'NOT_FOUND', message: 'Todo not found' });
      return;
    }

    reply.status(204).send();
  });
}
