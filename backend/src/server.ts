import { buildApp } from './app.js';
import { config } from './config/env.js';
import { runMigrations } from './db/connection.js';
import { pool } from './db/connection.js';

async function start() {
  const app = await buildApp();

  try {
    await runMigrations();
    app.log.info('Database migrations completed');
  } catch (error) {
    app.log.error(error, 'Failed to run database migrations');
    process.exit(1);
  }

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    app.log.info(`${signal} received, shutting down`);
    await app.close();
    await pool.end();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  console.error('Fatal startup error:', error);
  process.exit(1);
});
