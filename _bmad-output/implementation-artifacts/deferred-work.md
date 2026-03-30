# Deferred Work

## Deferred from: code review of story 1-1-project-scaffolding-and-infrastructure-setup (2026-03-30)

- Docker `DATABASE_URL` breaks on special characters in password — URL interpolation in docker-compose.yml doesn't URL-encode password. Not an issue with default credentials; revisit when real secrets are used.
- Dockerfile runs as root with no HEALTHCHECK — hardening issue. Add non-root USER and Docker HEALTHCHECK before production deployment.
- `pino` not listed as explicit dependency in package.json — Fastify bundles pino transitively. Consider adding explicit dep if Pino APIs are used directly in future stories.
