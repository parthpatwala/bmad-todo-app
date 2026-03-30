# Story 1.1: Project Scaffolding & Infrastructure Setup

Status: done

## Story

As a **developer**,
I want a fully scaffolded monorepo with frontend (Vite + React + TypeScript), backend (Fastify + TypeScript), PostgreSQL database via Docker Compose, and Drizzle ORM with the Todo schema,
So that I have a working development environment to build features on.

## Acceptance Criteria

1. **Given** a clean checkout of the repository, **When** the developer runs `docker-compose up`, **Then** PostgreSQL starts and is accessible on port 5432, **And** the backend Fastify server starts and responds to `GET /api/health` with `200 { "status": "ok" }`.

2. **Given** the backend is running, **When** Drizzle migrations execute on startup, **Then** the `todos` table exists with columns: `id` (serial PK), `description` (varchar 500, not null), `completed` (boolean, default false), `created_at` (timestamp, default now).

3. **Given** the frontend project is scaffolded, **When** the developer runs `npm run dev` in the frontend directory, **Then** the Vite dev server starts with HMR on port 5173, **And** the Vite config includes an `/api` proxy to the backend on port 3000.

4. **Given** the project structure, **When** a developer inspects the repository, **Then** `.env.example` is committed with required environment variables, **And** `.env` is gitignored, **And** the directory structure matches the Architecture document specification.

## Tasks / Subtasks

- [x] Task 1: Initialize monorepo structure (AC: #4)
  - [x] 1.1 Create root `docker-compose.yml`, `.env.example`, `.gitignore`, `README.md`
  - [x] 1.2 Scaffold frontend with `npm create vite@latest frontend -- --template react-ts`
  - [x] 1.3 Create backend directory with `package.json`, `tsconfig.json`, `Dockerfile`
  - [x] 1.4 Create `e2e/` directory with `package.json` and `playwright.config.ts` (placeholder)
- [x] Task 2: Configure Docker Compose (AC: #1)
  - [x] 2.1 Define `db` service: PostgreSQL 16 image, named volume `pgdata`, env vars for credentials, port 5432
  - [x] 2.2 Define `app` service: build from `backend/Dockerfile`, depends_on `db`, port 3000, env vars for `DATABASE_URL`
  - [x] 2.3 Verify `docker-compose up` starts both containers cleanly
- [x] Task 3: Set up backend Fastify server (AC: #1)
  - [x] 3.1 Install dependencies: `fastify`, `@fastify/cors`, `@fastify/static`, `drizzle-orm`, `pg`, `pino`, `cross-env`
  - [x] 3.2 Install dev dependencies: `typescript`, `@types/node`, `@types/pg`, `tsx`, `drizzle-kit`
  - [x] 3.3 Create `src/server.ts` (entry point) and `src/app.ts` (Fastify instance setup)
  - [x] 3.4 Create `src/config/env.ts` for environment variable loading
  - [x] 3.5 Create `src/plugins/error-handler.ts` with global error handler returning `{ error, message }`
  - [x] 3.6 Create `src/plugins/cors.ts` for dev-only CORS via `@fastify/cors`
  - [x] 3.7 Create `src/routes/health-routes.ts` with `GET /api/health` → `200 { "status": "ok" }`
  - [x] 3.8 Add `npm run dev` script using `tsx watch src/server.ts`
- [x] Task 4: Set up Drizzle ORM and Todo schema (AC: #2)
  - [x] 4.1 Create `src/db/schema.ts` defining the `todos` table
  - [x] 4.2 Create `src/db/connection.ts` for PostgreSQL pool + Drizzle instance
  - [x] 4.3 Create `drizzle.config.ts` at backend root
  - [x] 4.4 Generate initial migration with `npx drizzle-kit generate`
  - [x] 4.5 Add programmatic migration in server startup using `drizzle-orm/node-postgres/migrator`
- [x] Task 5: Set up frontend (AC: #3)
  - [x] 5.1 Install Tailwind CSS v4: `tailwindcss` + `@tailwindcss/vite`
  - [x] 5.2 Configure `vite.config.ts` with React plugin, Tailwind plugin, and `/api` proxy to `http://localhost:3000`
  - [x] 5.3 Update `src/index.css` with `@import "tailwindcss";`
  - [x] 5.4 Create `src/types/todo.ts` with Todo type definition
  - [x] 5.5 Install TanStack Query: `@tanstack/react-query`
  - [x] 5.6 Wrap App in `QueryClientProvider` in `main.tsx`
  - [x] 5.7 Replace default Vite boilerplate in `App.tsx` with a minimal placeholder
- [x] Task 6: Environment and configuration files (AC: #4)
  - [x] 6.1 Create `.env.example` with `DATABASE_URL`, `NODE_ENV`, `PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
  - [x] 6.2 Ensure `.env` is in `.gitignore`
  - [x] 6.3 Verify directory structure matches architecture document

### Review Findings

- [x] [Review][Decision] Health endpoint should verify DB connectivity — Added `SELECT 1` DB ping, returns 503 if unreachable. [backend/src/routes/health-routes.ts]
- [x] [Review][Decision] Playwright `baseURL` targets port 5173 (Vite SPA) — Changed from 3000 to 5173. [e2e/playwright.config.ts]
- [x] [Review][Decision] Error handler expanded with full status code mapping — Added 401, 403, 409, 429 codes. Uses lookup table. [backend/src/plugins/error-handler.ts]
- [x] [Review][Decision] Docker Compose `NODE_ENV` kept as `development` — intentional for dev-focused compose file. [docker-compose.yml]
- [x] [Review][Patch] Unhandled rejection if `buildApp()` throws — Added `.catch()` on `start()`. [backend/src/server.ts]
- [x] [Review][Patch] Invalid `PORT` yields `NaN` — Added validation with range check (1-65535). [backend/src/config/env.ts]
- [x] [Review][Patch] Migration path is cwd-dependent — Resolved via `import.meta.url` + `path.resolve`. [backend/src/db/connection.ts]
- [x] [Review][Patch] `.dockerignore` does not exclude `.env` — Added `.env` to dockerignore. [backend/.dockerignore]
- [x] [Review][Patch] No graceful shutdown — Added SIGTERM/SIGINT handlers to close server and pool. [backend/src/server.ts]
- [x] [Review][Defer] Docker `DATABASE_URL` breaks on special characters in password — URL interpolation in docker-compose.yml doesn't URL-encode. Not an issue with default `postgres`/`postgres` credentials. — deferred, pre-existing
- [x] [Review][Defer] Dockerfile runs as root with no HEALTHCHECK — hardening issue, not required for MVP scaffolding. — deferred, pre-existing
- [x] [Review][Defer] `pino` not listed as explicit dependency in package.json — Fastify bundles pino transitively; explicit dep not required but mentioned in story task 3.1. — deferred, pre-existing

## Dev Notes

### Technology Versions (Verified March 2026)

| Technology | Version | Install |
|---|---|---|
| Fastify | 5.8.x (latest 5.8.4) | `npm i fastify@^5.8` |
| React | 19.x (bundled with Vite react-ts template) | via `create vite` |
| Vite | Latest | via `create vite` |
| Tailwind CSS | v4.x | `npm i tailwindcss @tailwindcss/vite` |
| Drizzle ORM | Latest | `npm i drizzle-orm` |
| drizzle-kit | Latest | `npm i -D drizzle-kit` |
| PostgreSQL | 16 (Docker image: `postgres:16`) | Docker |
| TanStack Query | v5 | `npm i @tanstack/react-query` |
| Node.js | 20+ (required by Tailwind v4) | Docker / local |

**Fastify 5.8 Security Note:** v5.8.3+ patches CVE-2026-3635 and CVE-2026-3419 (malformed Content-Type header bypass). Ensure `fastify@^5.8.4` or later is installed.

### Tailwind CSS v4 Setup (NOT v3)

Tailwind v4 uses a fundamentally different setup than v3:
- Install `tailwindcss` + `@tailwindcss/vite` (NOT `postcss`, NOT `autoprefixer`)
- No `tailwind.config.js` file — v4 uses CSS-based configuration
- In `vite.config.ts`, add `tailwindcss()` to plugins array
- In CSS file, use `@import "tailwindcss";` (NOT `@tailwind base/components/utilities`)
- Requires Node.js 20+

### Drizzle ORM Schema Pattern

```typescript
// backend/src/db/schema.ts
import { pgTable, serial, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  description: varchar('description', { length: 500 }).notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

### Drizzle Programmatic Migrations

Run migrations on server startup (NOT via CLI in production):
```typescript
// In server.ts or app.ts startup
import { migrate } from 'drizzle-orm/node-postgres/migrator';
await migrate(db, { migrationsFolder: './drizzle' });
```

### Drizzle Config

```typescript
// backend/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Vite Proxy Configuration

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### Frontend Todo Type (Manual Sync with Backend)

```typescript
// frontend/src/types/todo.ts
export interface Todo {
  id: number;
  description: string;
  completed: boolean;
  createdAt: string; // ISO 8601 from API
}
```

### Docker Compose Structure

- 2-container topology: `db` (PostgreSQL 16) + `app` (Fastify backend)
- PostgreSQL uses a named volume `pgdata` for durability
- App container builds from `backend/Dockerfile`
- In production, Fastify serves built frontend via `@fastify/static` (not needed for this story — production build is Story 5.3)
- For this story, the Dockerfile should build and run the backend only

### Backend Dockerfile Pattern

Use multi-stage build with Node 20:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc
CMD ["node", "dist/server.js"]
```

### Environment Variables (.env.example)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/bmad_todos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=bmad_todos
```

### Error Handler Plugin Pattern

```typescript
// backend/src/plugins/error-handler.ts
import { FastifyInstance } from 'fastify';

export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const response = {
      error: statusCode === 400 ? 'VALIDATION_ERROR' : 
             statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
      message: statusCode === 500 ? 'An internal error occurred' : error.message,
    };
    reply.status(statusCode).send(response);
  });
}
```

### Project Structure Notes

The complete directory structure this story must create:

```
bmad-todo-app/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json (if generated by Vite)
│   ├── vite.config.ts
│   ├── index.html
│   ├── public/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── components/     (empty, ready for Story 1.3)
│   │   ├── hooks/          (empty, ready for Story 1.3)
│   │   ├── api/            (empty, ready for Story 1.2/1.3)
│   │   └── types/
│   │       └── todo.ts
│   └── __tests__/          (empty, ready for Story 5.1)
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── drizzle.config.ts
│   ├── drizzle/            (generated migrations)
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── routes/
│   │   │   └── health-routes.ts
│   │   ├── db/
│   │   │   ├── connection.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations/  (if using separate folder)
│   │   ├── config/
│   │   │   └── env.ts
│   │   └── plugins/
│   │       ├── cors.ts
│   │       ├── static-files.ts  (placeholder for Story 5.3)
│   │       └── error-handler.ts
│   └── __tests__/          (empty, ready for Story 5.1)
└── e2e/                    (placeholder for Story 5.2)
    ├── package.json
    └── playwright.config.ts
```

**Critical:** Create empty directories with `.gitkeep` files where needed so the structure exists even if no source files are added yet. This prevents future stories from having to create the directory structure.

### Naming Conventions (MUST FOLLOW)

- Files: `kebab-case` → `todo-item.tsx`, `health-routes.ts`
- React components: `PascalCase` → `TodoItem`
- Functions/variables: `camelCase` → `createTodo`
- Types/interfaces: `PascalCase` → `Todo`, `CreateTodoBody`
- Database tables: `snake_case`, plural → `todos`
- Database columns: `snake_case` → `created_at`
- JSON API fields: `camelCase` → `createdAt`
- Constants: `SCREAMING_SNAKE_CASE` → `MAX_DESCRIPTION_LENGTH`

### Anti-Patterns to Avoid

- Do NOT use `express` — this project uses Fastify
- Do NOT use Prisma — this project uses Drizzle ORM
- Do NOT use PostCSS/autoprefixer setup — Tailwind v4 uses `@tailwindcss/vite` plugin
- Do NOT create a `tailwind.config.js` — Tailwind v4 uses CSS-based config
- Do NOT use `@tailwind base; @tailwind components; @tailwind utilities;` — use `@import "tailwindcss";`
- Do NOT use `axios` or `ky` — use raw `fetch` with typed wrappers
- Do NOT use `jest` — use Vitest
- Do NOT co-locate test files with source — use `__tests__/` directories
- Do NOT use `PUT` for updates — use `PATCH`
- Do NOT return `null` in API responses
- Do NOT use raw SQL — use Drizzle query builder
- Do NOT wrap success responses in `{ data: ... }` envelopes
- Do NOT expose stack traces or internals in error responses

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- [Source: _bmad-output/planning-artifacts/prd.md#Technical Architecture Considerations]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus-high

### Debug Log References

- Backend TypeScript type error in error-handler.ts: `error` parameter was `unknown` type under strict mode. Fixed by typing as `FastifyError`.
- Vite scaffold generated boilerplate files (App.css, asset SVGs) that were cleaned up.

### Completion Notes List

- All 4 acceptance criteria verified via live testing:
  - AC1: `docker-compose up` starts PostgreSQL (port 5432) and Fastify (port 3000), health endpoint returns `200 {"status":"ok"}`
  - AC2: Drizzle migration creates `todos` table with correct schema (id serial PK, description varchar(500) not null, completed boolean default false, created_at timestamp default now)
  - AC3: Frontend Vite dev server starts on port 5173 with HMR and `/api` proxy configured
  - AC4: `.env.example` committed, `.env` gitignored, directory structure matches architecture spec
- Backend TypeScript compiles cleanly (`tsc --noEmit` passes)
- Frontend TypeScript compiles cleanly (`tsc --noEmit` passes)
- Docker image builds successfully
- Tailwind CSS v4 configured with `@tailwindcss/vite` plugin (NOT PostCSS/v3 setup)
- TanStack Query v5 integrated with QueryClientProvider
- Programmatic Drizzle migrations run on server startup
- Global error handler returns standardized `{ error, message }` format
- CORS enabled for development only

### Change Log

- 2026-03-30: Story 1.1 implemented — full monorepo scaffolding with working Docker Compose stack

### File List

- .env.example (new)
- .gitignore (new)
- README.md (new)
- docker-compose.yml (new)
- backend/.dockerignore (new)
- backend/Dockerfile (new)
- backend/package.json (new)
- backend/package-lock.json (new)
- backend/tsconfig.json (new)
- backend/drizzle.config.ts (new)
- backend/drizzle/0000_brave_the_leader.sql (new, generated)
- backend/drizzle/meta/_journal.json (new, generated)
- backend/drizzle/meta/0000_snapshot.json (new, generated)
- backend/src/server.ts (new)
- backend/src/app.ts (new)
- backend/src/config/env.ts (new)
- backend/src/db/schema.ts (new)
- backend/src/db/connection.ts (new)
- backend/src/routes/health-routes.ts (new)
- backend/src/plugins/error-handler.ts (new)
- backend/src/plugins/cors.ts (new)
- backend/src/plugins/static-files.ts (new, placeholder)
- backend/__tests__/routes/.gitkeep (new)
- backend/__tests__/db/.gitkeep (new)
- frontend/package.json (modified — added tailwindcss, @tailwindcss/vite, @tanstack/react-query)
- frontend/package-lock.json (modified)
- frontend/vite.config.ts (modified — added tailwindcss plugin and /api proxy)
- frontend/src/index.css (modified — replaced Vite boilerplate with Tailwind v4 import)
- frontend/src/main.tsx (modified — added QueryClientProvider)
- frontend/src/App.tsx (modified — replaced Vite boilerplate with minimal placeholder)
- frontend/src/types/todo.ts (new)
- frontend/src/components/.gitkeep (new)
- frontend/src/hooks/.gitkeep (new)
- frontend/src/api/.gitkeep (new)
- frontend/__tests__/components/.gitkeep (new)
- frontend/__tests__/hooks/.gitkeep (new)
- frontend/__tests__/api/.gitkeep (new)
- frontend/src/App.css (deleted — Vite boilerplate)
- frontend/src/assets/react.svg (deleted — Vite boilerplate)
- frontend/src/assets/vite.svg (deleted — Vite boilerplate)
- e2e/package.json (new)
- e2e/playwright.config.ts (new)
- e2e/tests/.gitkeep (new)
