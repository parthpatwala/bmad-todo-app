# Security Review: bmad-todo-app

**Date:** 2026-03-31
**Scope:** `backend/src/`, `frontend/src/`, `docker-compose.yml`, `backend/Dockerfile`, `.env.example`, `.env`
**Method:** AI-driven static code audit (no dynamic scanning or `npm audit` in this pass)

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 2 |
| Medium | 5 |
| Low | 4 |
| Info | 4 |

The API uses parameterized Drizzle queries and JSON schema validation, which mitigates SQL injection and mass assignment. The React UI renders text nodes (no `dangerouslySetInnerHTML`), which limits DOM XSS. Gaps are mostly missing access control, deployment/config hardening, abuse controls, and sensitive defaults — appropriate for a single-user MVP.

## Findings

### 1. No authentication or authorization (API fully public)

| Field | Value |
|-------|-------|
| Category | Auth / Access Control |
| Severity | **High** |
| Location | `backend/src/routes/todo-routes.ts` (all routes); `backend/src/app.ts` (no auth middleware) |
| Description | All `/api/todos` operations are callable by anyone who can reach the server. There are no users, sessions, API keys, or resource-level checks. Any client can list, create, update, or delete todos. |
| Recommended Fix | For a single-user demo, document this as a known limitation and ensure the app is only accessible on trusted networks. For multi-user use, add authentication (session/JWT/OAuth), tie todos to a user ID in the schema, and enforce ownership on every route. |

### 2. No CSRF protection for state-changing API calls

| Field | Value |
|-------|-------|
| Category | CSRF |
| Severity | **High** (if cookie-based auth is added); **Info** today |
| Location | `backend/src/routes/todo-routes.ts` (POST, PATCH, DELETE); `frontend/src/api/todo-api.ts` |
| Description | The app is currently cookie-less for API calls (fetch with JSON only), so classic browser CSRF is not applicable. If cookie-based sessions are added later, state-changing endpoints will need CSRF tokens or strict SameSite + CORS. |
| Recommended Fix | When introducing cookie-based sessions, add a CSRF strategy (double-submit cookie or synchronizer token) and keep CORS/origin policies explicit. For Bearer tokens in Authorization header, CSRF risk is lower. |

### 3. Development CORS reflects any origin

| Field | Value |
|-------|-------|
| Category | Config / CORS |
| Severity | **Medium** |
| Location | `backend/src/plugins/cors.ts:7-10` |
| Description | When `NODE_ENV=development`, `origin: true` causes the server to reflect the request's Origin header, allowing any website's JavaScript to call the API if the browser can reach the dev server. |
| Recommended Fix | Restrict dev origins to `http://localhost:5173` (Vite port) via an allowlist. Confirm production never sets `isDev` true on a public URL. |

### 4. Weak default database credentials

| Field | Value |
|-------|-------|
| Category | Config / Sensitive Defaults |
| Severity | **Medium** |
| Location | `docker-compose.yml:6-8,30`; `.env.example:3-6`; `backend/src/config/env.ts:12` |
| Description | Defaults use `postgres`/`postgres` and map PostgreSQL port 5432 to the host. `config/env.ts` falls back to a hardcoded `postgresql://postgres:postgres@localhost:5432/bmad_todos` if `DATABASE_URL` is unset. |
| Recommended Fix | Use strong random passwords in non-local deployments. Do not publish port 5432 publicly in production. Require `DATABASE_URL` in production and fail startup if missing. Document that `.env.example` values are not for production. |

### 5. `.env` contains credentials on disk

| Field | Value |
|-------|-------|
| Category | Sensitive Data Exposure |
| Severity | **Medium** (if committed); **Low** (local + gitignored) |
| Location | `.env` (full file) |
| Description | `.env` lists `DATABASE_URL` and `POSTGRES_PASSWORD` with real values. `.gitignore` includes `.env`, which is good. Risk is accidental commit, backup leakage, or sharing the repo with `.env` still present. |
| Recommended Fix | Never commit `.env`. Use secrets managers in deployment. Rotate credentials if this file was ever pushed. |

### 6. No rate limiting or abuse controls

| Field | Value |
|-------|-------|
| Category | Availability / Abuse |
| Severity | **Medium** |
| Location | `backend/src/app.ts`; `backend/src/routes/todo-routes.ts` |
| Description | No throttling, per-IP limits, or request size limits beyond Fastify/JSON defaults. An attacker could spam creates/deletes to stress DB and CPU. |
| Recommended Fix | Add `@fastify/rate-limit`, consider explicit `bodyLimit`, and monitor for unusual traffic. |

### 7. Missing standard HTTP security headers

| Field | Value |
|-------|-------|
| Category | Config / Defense in Depth |
| Severity | **Medium** |
| Location | `backend/src/app.ts` (no `@fastify/helmet` or equivalent) |
| Description | No explicit Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy headers. The SPA is lower risk for reflected XSS, but headers help with clickjacking, MIME sniffing, and tightening policy. |
| Recommended Fix | Register `@fastify/helmet` with a CSP appropriate for the Vite/React build. |

### 8. Server binds to all interfaces

| Field | Value |
|-------|-------|
| Category | Config / Network Exposure |
| Severity | **Low** |
| Location | `backend/src/config/env.ts:10`; `backend/src/server.ts:18` |
| Description | `host: '0.0.0.0'` listens on all interfaces, which is normal in Docker but increases exposure if the container runs on a machine with untrusted networks. |
| Recommended Fix | In hardened deployments, bind to `127.0.0.1` behind a reverse proxy, or rely on Docker/network policies to restrict access. |

### 9. Container image previously ran as root (now fixed)

| Field | Value |
|-------|-------|
| Category | Config / Container Hardening |
| Severity | **Low** (resolved) |
| Location | `backend/Dockerfile:27` |
| Description | The production stage previously had no `USER` directive. Now uses `USER node` (uid 1000 from node:20-alpine). |
| Recommended Fix | No further action needed. |

### 10. SPA fallback path edge cases

| Field | Value |
|-------|-------|
| Category | Routing / Info Disclosure |
| Severity | **Low** |
| Location | `backend/src/plugins/static-files.ts:18-22` |
| Description | Non-API unknown paths receive `index.html`. The `/api` prefix check uses `request.url.startsWith('/api')`. Unusual URL encodings are generally handled by Fastify's URL normalization. |
| Recommended Fix | Rely on Fastify's URL normalization. Add tests for edge paths if the API routing becomes more complex. |

### 11. GET /api/todos unbounded (no pagination)

| Field | Value |
|-------|-------|
| Category | Availability |
| Severity | **Low** |
| Location | `backend/src/routes/todo-routes.ts:33-35` |
| Description | The GET endpoint returns all todos with no limit or pagination. With large data volumes, this could cause memory/performance issues. |
| Recommended Fix | Add pagination (limit/offset or cursor-based) if data volume grows. Acceptable for single-user MVP. |

### 12. Dependency and supply-chain hygiene

| Field | Value |
|-------|-------|
| Category | Dependencies |
| Severity | **Info** |
| Location | `backend/package.json`, `frontend/package.json` |
| Description | Dependencies use semver ranges (`^`). No vulnerable package was identified from static inspection. Transitive issues require `npm audit` / Dependabot on CI. |
| Recommended Fix | Run `npm audit` in `backend/` and `frontend/`, enable automated dependency updates, and pin lockfiles in builds (already done via `npm ci` in Dockerfile). |

### 13. TLS not configured

| Field | Value |
|-------|-------|
| Category | Config |
| Severity | **Info** |
| Location | `docker-compose.yml` |
| Description | App and DB communicate in plaintext on the Docker network. HTTP is cleartext to the host. |
| Recommended Fix | Terminate TLS at a reverse proxy or load balancer in production. Not in scope for MVP per architecture spec. |

### 14. No logging of security-relevant events

| Field | Value |
|-------|-------|
| Category | Observability |
| Severity | **Info** |
| Location | `backend/src/app.ts` |
| Description | No audit logging for failed requests, unusual patterns, or rate-limit violations. Pino logs requests but doesn't flag security-relevant events. |
| Recommended Fix | Add structured logging for auth failures, validation rejections, and unusual traffic patterns when auth is implemented. |

### 15. Error handler does not leak stack traces

| Field | Value |
|-------|-------|
| Category | Info Disclosure |
| Severity | **Info** (positive) |
| Location | `backend/src/plugins/error-handler.ts:18-20` |
| Description | 5xx responses return `"An internal error occurred"` without stack traces. This is correct behavior. |
| Recommended Fix | No action needed. |

## Positive Observations

- **SQL Injection:** Drizzle uses parameterized queries (`eq`, `insert`, etc.); health check uses a static `sql\`SELECT 1\`` template
- **XSS (React):** Todo text and API error strings are rendered as text nodes, not HTML
- **Input Validation:** JSON schemas with `additionalProperties: false` and typed params reduce injection and unexpected fields
- **Error Handling:** 5xx responses do not echo raw stack traces to clients
- **`.gitignore`:** `.env` is listed, reducing accidental secret commits
- **Non-root Docker:** Container now runs as `node` user (uid 1000)

## Conclusion

The application has a solid security posture for a single-user MVP. The most significant gaps (no auth, no CSRF) are architectural decisions appropriate for the current scope, not bugs. When evolving beyond a personal demo, prioritize: authentication/authorization, `@fastify/helmet` for security headers, `@fastify/rate-limit` for abuse prevention, and TLS termination.
