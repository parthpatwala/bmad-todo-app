import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { config } from '../config/env.js';

export async function corsPlugin(app: FastifyInstance) {
  if (config.isDev) {
    await app.register(cors, {
      origin: true,
    });
  }
}
