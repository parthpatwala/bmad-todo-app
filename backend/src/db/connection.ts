import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { config } from '../config/env.js';
import * as schema from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
});

export const db = drizzle(pool, { schema });

export async function runMigrations() {
  const migrationsFolder = path.resolve(__dirname, '../../drizzle');
  await migrate(db, { migrationsFolder });
}
