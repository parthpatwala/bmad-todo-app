import Fastify from 'fastify';
import { config } from './config/env.js';
import { errorHandler } from './plugins/error-handler.js';
import { corsPlugin } from './plugins/cors.js';
import { healthRoutes } from './routes/health-routes.js';
import { todoRoutes } from './routes/todo-routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.isDev ? 'debug' : 'info',
    },
  });

  await app.register(errorHandler);
  await app.register(corsPlugin);
  await app.register(healthRoutes);
  await app.register(todoRoutes);

  return app;
}
