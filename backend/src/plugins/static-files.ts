import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const staticFiles = fp(async function staticFiles(app: FastifyInstance) {
  const publicDir = path.resolve(__dirname, '../../public');

  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/',
    wildcard: false,
  });

  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith('/api')) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Route not found' });
    }
    return reply.sendFile('index.html');
  });
});
