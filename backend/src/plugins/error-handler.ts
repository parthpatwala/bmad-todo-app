import type { FastifyInstance, FastifyError } from 'fastify';

const STATUS_CODE_MAP: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'TOO_MANY_REQUESTS',
};

export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const errorCode = STATUS_CODE_MAP[statusCode] ?? 'INTERNAL_ERROR';

    const message = statusCode >= 500
      ? 'An internal error occurred'
      : error.message;

    if (statusCode >= 500) {
      app.log.error(error);
    }

    reply.status(statusCode).send({ error: errorCode, message });
  });
}
