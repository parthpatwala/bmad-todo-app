import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fp from 'fastify-plugin';
import { config } from '../config/env.js';

export const corsPlugin = fp(async function corsPlugin(app: FastifyInstance) {
  if (config.isDev) {
    await app.register(cors, {
      origin: true,
    });
  }
});
