import type { FastifyInstance } from 'fastify';
import { db } from '../db/connection.js';
import { sql } from 'drizzle-orm';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/api/health', async (_request, reply) => {
    try {
      await db.execute(sql`SELECT 1`);
      return { status: 'ok' };
    } catch {
      reply.status(503).send({ status: 'unhealthy', error: 'Database unreachable' });
    }
  });
}
