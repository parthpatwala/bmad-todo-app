const port = parseInt(process.env.PORT || '3000', 10);

if (!Number.isFinite(port) || port < 1 || port > 65535) {
  console.error(`Invalid PORT: "${process.env.PORT}". Must be a number between 1 and 65535.`);
  process.exit(1);
}

export const config = {
  port,
  host: '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bmad_todos',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
};
