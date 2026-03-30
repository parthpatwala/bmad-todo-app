# Deferred Work

## Deferred from: code review of story 1-1-project-scaffolding-and-infrastructure-setup (2026-03-30)

- Docker `DATABASE_URL` breaks on special characters in password — URL interpolation in docker-compose.yml doesn't URL-encode password. Not an issue with default credentials; revisit when real secrets are used.
- Dockerfile runs as root with no HEALTHCHECK — hardening issue. Add non-root USER and Docker HEALTHCHECK before production deployment.
- `pino` not listed as explicit dependency in package.json — Fastify bundles pino transitively. Consider adding explicit dep if Pino APIs are used directly in future stories.

## Deferred from: code review of story 1-2-api-endpoints-for-todo-crud (2026-03-30)

- GET /api/todos is unbounded (no pagination/limit) — single-user MVP with low data volume. Add pagination if data grows.
- Unicode invisible characters (e.g. U+00A0 no-break space) bypass String.trim() — `trim()` handles standard ASCII whitespace. Exotic Unicode whitespace could produce visually-empty descriptions. Not actionable for personal todo MVP.
- 413 Payload Too Large maps to INTERNAL_ERROR — error handler STATUS_CODE_MAP does not include 413. Low priority since description max is 500 chars and Fastify default body limit is 1MiB.
