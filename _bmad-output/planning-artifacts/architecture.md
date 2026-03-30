---
stepsCompleted:
  - step-01-init.md
  - step-02-context.md
  - step-03-starter.md
  - step-04-decisions.md
  - step-05-patterns.md
  - step-06-structure.md
  - step-07-validation.md
  - step-08-complete.md
lastStep: 8
status: 'complete'
completedAt: '2026-03-30'
inputDocuments:
  - prd.md
workflowType: 'architecture'
project_name: 'bmad-todo-app'
user_name: 'parth'
date: '2026-03-30'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
31 functional requirements across 7 categories. The core domain is a single-entity CRUD application (Todo) with four operations: create, read (list), update (toggle completion), and delete. Requirements extend beyond basic CRUD to include input validation (FR10-FR12), explicit UI state management for empty/loading/error states (FR16-FR20), optimistic updates with rollback (FR20), responsive layout across mobile-to-desktop viewports (FR21-FR24), accessibility compliance (FR25-FR28), and a REST API contract (FR29-FR31).

**Non-Functional Requirements:**
22 NFRs define hard constraints on performance (API <200ms, UI feedback <100ms, FCP <1.5s, bundle <200KB gzipped), security (server-side input sanitization, no exposed internals), reliability (durable storage, optimistic rollback, graceful degradation), accessibility (WCAG 2.1 AA, keyboard navigation, focus management), deployment (single docker-compose command, no external dependencies), and testability (70% coverage, 5 E2E tests, deterministic tests).

**Scale & Complexity:**

- Primary domain: Full-stack web application (SPA + REST API + persistent database)
- Complexity level: Low
- Estimated architectural components: 3 (frontend SPA, backend API server, database)
- Entity count: 1 (Todo)
- User model: Single anonymous user (no authentication)

### Technical Constraints & Dependencies

- SPA architecture — client-side rendering only, no SSR/SSG
- REST API — standard HTTP methods over JSON, no WebSocket/SSE/GraphQL
- Stateless server — no server-side sessions for MVP
- ES2020+ browser target — no legacy/IE support, no polyfills needed
- Durable storage — in-memory databases are excluded; must survive server restarts
- Docker-based deployment — entire stack defined in docker-compose with no external dependencies
- No offline support — network connectivity required

### Cross-Cutting Concerns Identified

- **Error handling consistency:** Every mutation path (create, toggle, delete) must handle API failure with user-friendly messaging on the client and sanitized error responses on the server. No raw stack traces in either direction.
- **Optimistic state management:** All three mutation operations must update UI immediately, then reconcile with server response — rolling back on failure. This affects state management architecture across the entire frontend.
- **Accessibility:** Not isolated to a single component — every interactive element requires keyboard operability, ARIA labeling, focus management, and contrast compliance. This is a cross-cutting design constraint.
- **Input validation:** Dual validation required — client-side for UX responsiveness, server-side for security. Must stay consistent between layers.
- **Responsive design:** All UI components must function across 320px–1920px viewports with touch-friendly targets on mobile. Layout strategy affects every component.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application: React SPA (Vite) + Fastify REST API + PostgreSQL. No full-stack metaframework needed — SSR is explicitly excluded. Two independent services connected via HTTP.

### Starter Options Considered

| Option | Approach | Verdict |
|---|---|---|
| **Vite `react-ts` + Fastify manual setup** | Official Vite scaffold for frontend; manual Fastify+TS project for backend | **Selected** — minimal, well-understood, no unnecessary abstractions |
| **T3 Stack / create-t3-app** | Full-stack Next.js + tRPC + Prisma | Rejected — brings SSR, tRPC, and Next.js which contradict the SPA+REST requirements |
| **RedwoodJS** | Full-stack framework with React + GraphQL | Rejected — opinionated toward GraphQL, not REST |
| **Custom monorepo starter (Turborepo)** | Turborepo with shared packages | Overkill — two services with no shared code don't justify monorepo tooling overhead |

### Selected Approach: Vite `react-ts` + Manual Fastify TypeScript Setup

**Rationale:** The project has two clearly separated services (SPA client, REST API server) with a simple JSON contract between them. Using the official Vite scaffold gives us a battle-tested React+TypeScript foundation, and Fastify's manual TypeScript setup is straightforward for a 4-endpoint API. This avoids framework lock-in and keeps total dependencies minimal.

**Initialization Commands:**

```bash
# Frontend (from project root)
npm create vite@latest frontend -- --template react-ts

# Backend (from project root)
mkdir backend && cd backend
npm init -y
npm i fastify
npm i -D typescript @types/node
npx tsc --init
```

**Architectural Decisions Provided by Starters:**

**Language & Runtime:**
- TypeScript across both services (ES2020+ target)
- Node.js runtime for backend

**Styling Solution:**
- Tailwind CSS v4.x via `@tailwindcss/vite` plugin
- CSS-in-CSS configuration (v4 style — `@import "tailwindcss"`)

**Build Tooling:**
- Vite for frontend dev server, HMR, and production builds
- `tsc` for backend TypeScript compilation

**Testing Framework:**
- Vitest v4.x for unit/integration tests (both frontend and backend)
- Playwright for E2E tests (per PRD requirement)
- @testing-library/react for component tests

**Code Organization:**
- Monorepo with two top-level directories: `frontend/` and `backend/`
- Each service has its own `package.json`, `tsconfig.json`, and independent dependency tree
- Shared types defined as a lightweight `shared/` directory or inline duplicated (decision deferred to step 4)

**Development Experience:**
- Vite HMR for instant frontend feedback
- `tsx` or `ts-node` for backend dev with watch mode
- Docker Compose for running the full stack locally

**Database ORM:**
- Drizzle ORM for PostgreSQL access — chosen for performance (3-5x faster queries), minimal bundle size (~7KB), SQL-like syntax that maps naturally to a simple CRUD API, and no code generation step. Aligns with the "boring technology" principle for a developer who already knows SQL.

**Current Versions (verified March 2026):**

| Technology | Version |
|---|---|
| Vite | Latest (with react-ts template) |
| React | 19.x (bundled with Vite template) |
| Fastify | 5.8.x |
| Tailwind CSS | 4.2.x |
| Vitest | 4.1.x |
| Drizzle ORM | Latest |
| PostgreSQL | 16.x (Docker image) |
| Playwright | Latest |

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data model: Auto-increment integer IDs, 500-char description limit, boolean completion, timestamp
- API contract: 4 REST endpoints with `/api/` prefix
- State management: TanStack Query for server state with optimistic updates
- Database access: Drizzle ORM with drizzle-kit migrations
- Deployment: 2-container Docker Compose (app + db)

**Important Decisions (Shape Architecture):**
- Request validation via Fastify JSON Schema
- Error response standardization
- CORS configuration for development
- Pino logging via Fastify built-in
- cross-env for cross-platform script compatibility
- Health check endpoint

**Deferred Decisions (Post-MVP):**
- Authentication & authorization (Phase 2)
- Todo description editing (Phase 2)
- CI/CD pipeline (Phase 2)
- Rate limiting (Phase 2)
- Monitoring & alerting (Phase 2)

### Data Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Primary key | Auto-increment integer | Simpler, readable in logs, better index performance. No distributed/offline ID generation needed for single-user MVP |
| Description max length | 500 characters | Comfortable paragraph length for personal tasks without inviting abuse |
| ORM | Drizzle ORM | 3-5x faster queries, ~7KB bundle, SQL-like syntax, no code generation step, parameterized queries prevent SQL injection |
| Migrations | drizzle-kit generate + migrate | Schema-driven migrations, run as part of Docker startup sequence |
| Caching | None | Single-user app with low data volume; PostgreSQL query performance is sufficient |

**Todo Schema:**

| Column | Type | Constraints |
|---|---|---|
| `id` | `serial` (auto-increment integer) | Primary key |
| `description` | `varchar(500)` | Not null, not empty |
| `completed` | `boolean` | Not null, default `false` |
| `created_at` | `timestamp` | Not null, default `now()` |

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| Authentication | None (MVP) | Single anonymous user per PRD. Architecture supports adding auth in Phase 2 without rework |
| Request validation | Fastify JSON Schema (built-in) | Zero additional dependencies, auto-generates 400 responses, idiomatic Fastify |
| SQL injection prevention | Drizzle parameterized queries | Handled by ORM layer — no raw SQL |
| XSS prevention | React default escaping | JSX escapes rendered strings by default. No server-side HTML sanitization needed |
| Input sanitization | Trim whitespace + enforce length (server-side) | Combined with schema validation covers the attack surface |
| Error responses | Standardized `{ error, message }` shape | Never exposes stack traces, file paths, or dependency versions |

**Error Response Format:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Description must not be empty"
}
```

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| API style | REST over JSON | PRD requirement, simplest approach for CRUD |
| URL prefix | `/api/` | Namespaces API routes, avoids collision when serving frontend from same origin |
| Update method | `PATCH` (not `PUT`) | Partial update of single field (completed). Semantically correct |
| Delete response | `204 No Content` | Client already knows which item was deleted |
| Timestamp format | ISO 8601 string | Human-readable, universally parsable |
| CORS | `@fastify/cors` (dev only) | Required for Vite dev server on different port. Unnecessary in production (same-origin) |
| API documentation | Architecture doc + README | No Swagger/OpenAPI for a 4-endpoint API |

**API Contract:**

| Method | Endpoint | Request Body | Success Response |
|---|---|---|---|
| `GET` | `/api/todos` | — | `200` with `Todo[]` |
| `POST` | `/api/todos` | `{ "description": "string" }` | `201` with `Todo` |
| `PATCH` | `/api/todos/:id` | `{ "completed": boolean }` | `200` with `Todo` |
| `DELETE` | `/api/todos/:id` | — | `204 No Content` |
| `GET` | `/api/health` | — | `200` with `{ "status": "ok" }` |

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| State management | TanStack Query | Built-in optimistic updates, rollback, loading/error states, cache management. Avoids hand-rolling server state logic |
| Component architecture | Flat, 7-8 components | Single page, no nesting complexity. App, TodoPage, TodoInput, TodoList, TodoItem, ErrorBanner/Toast, EmptyState, LoadingState |
| Routing | None | Single page, no navigation. Todo list rendered directly |
| API client | Raw `fetch` in typed `api.ts` helper | 4 endpoints don't justify axios/ky dependency. Typed wrapper provides safety |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | Utility-first, no CSS file management, responsive classes built-in |

**Component Tree:**
```
App (QueryClientProvider)
└── TodoPage
    ├── TodoInput
    ├── LoadingState (conditional)
    ├── ErrorBanner (conditional)
    ├── EmptyState (conditional)
    └── TodoList
        └── TodoItem (×N)
```

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Docker topology | 2 containers (app + db) | Fastify serves built frontend via `@fastify/static`. Simpler than 3-container setup, eliminates production CORS |
| Database container | PostgreSQL 16 with named volume | Durable storage that survives container restarts |
| Environment config | Environment variables + `.env.example` | Twelve-factor approach. `.env` gitignored, `.env.example` committed |
| Logging | Pino (Fastify built-in) | Fastest Node.js logger, zero config. `info` in production, `debug` in development |
| Cross-platform scripts | `cross-env` | Ensures `NODE_ENV` and env vars work on Windows, macOS, and Linux |
| CI/CD | None (MVP) | Tests run locally. Pipeline deferred to Phase 2 |
| Health check | `GET /api/health` | Database connectivity check. Used for Docker health checks |

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffolding (Vite + Fastify + Docker Compose + PostgreSQL)
2. Database schema + Drizzle ORM setup + migrations
3. API endpoints with Fastify JSON Schema validation
4. Frontend components + TanStack Query integration
5. Optimistic updates + error handling
6. Responsive styling + accessibility
7. Testing (Vitest + Playwright)
8. Production Docker build (Fastify serves static frontend)

**Cross-Component Dependencies:**
- Drizzle schema defines the Todo type → shared between backend handlers and migration files
- API contract shape → must match between Fastify response serialization and frontend `api.ts` types
- Error response format → must be consistent across all endpoints and consumed by frontend error handling
- Environment variables → shared between Docker Compose, backend config, and `.env.example`

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 5 categories where AI agents could make incompatible choices — naming, structure, format, communication, and process patterns.

### Naming Patterns

**Database Naming Conventions:**
- Tables: `snake_case`, plural → `todos`
- Columns: `snake_case` → `created_at`, `completed`
- Primary key: `id`
- Indexes: `idx_{table}_{column}` → `idx_todos_created_at`

**API Naming Conventions:**
- Endpoints: lowercase, plural → `/api/todos`
- Route parameters: `:id` (Fastify convention)
- JSON fields: `camelCase` → `{ id, description, completed, createdAt }`

**Code Naming Conventions:**
- Files: `kebab-case` → `todo-item.tsx`, `todo-routes.ts`
- React components: `PascalCase` → `TodoItem`, `TodoList`
- Functions/variables: `camelCase` → `createTodo`, `todoId`
- Types/interfaces: `PascalCase` → `Todo`, `CreateTodoBody`
- Constants: `SCREAMING_SNAKE_CASE` → `MAX_DESCRIPTION_LENGTH`

### Structure Patterns

**Test Organization:**
- Tests in a separate `__tests__/` directory mirroring the source structure
- Test files named `{source-file}.test.ts(x)`
- Frontend: `frontend/__tests__/components/todo-item.test.tsx`
- Backend: `backend/__tests__/routes/todo-routes.test.ts`
- E2E: `e2e/` directory at project root for Playwright tests

**Frontend Organization (by type):**
```
frontend/src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── api/            # API client functions
├── types/          # TypeScript type definitions
├── assets/         # Static assets
├── App.tsx
├── main.tsx
└── index.css
```

**Backend Organization:**
```
backend/src/
├── routes/         # Fastify route handlers
├── db/             # Drizzle schema, connection, migrations
├── config/         # Environment variable loading
├── plugins/        # Fastify plugins (CORS, static, error handler)
├── app.ts          # Fastify app setup
└── server.ts       # Entry point
```

### Format Patterns

**API Response Formats:**
- Success: Return data directly, no wrapper → `Todo[]` or `Todo`
- Error: `{ "error": "ERROR_CODE", "message": "Human-readable message" }`
- Delete success: `204 No Content` (empty body)
- Created success: `201 Created` with the created `Todo`

**Data Exchange Formats:**
- JSON fields: `camelCase` on the wire
- Dates: ISO 8601 strings → `"2026-03-30T12:00:00.000Z"`
- Booleans: `true`/`false` (never `1`/`0`)
- No `null` values in API responses — all fields always present and non-null

### Process Patterns

**Error Handling — Backend:**
- Global `setErrorHandler` on Fastify instance formats all errors into `{ error, message }`
- Known errors: 400 (validation), 404 (not found), with specific error codes
- Unknown errors: 500 with generic `"INTERNAL_ERROR"` — never leak internals
- Schema validation failures auto-return 400 via Fastify

**Error Handling — Frontend:**
- TanStack Query `onError` on mutations for per-operation error handling
- `ErrorBanner` component for global error display (dismissible)
- React error boundary as last-resort catch
- Never block the entire UI on error

**Optimistic Update Pattern:**
- `onMutate`: Snapshot current state, apply optimistic change to cache
- `onError`: Restore snapshot, show error toast/banner
- `onSettled`: Invalidate query to resync with server

**Loading State Patterns:**
- Initial fetch: Show `LoadingState` component while `useQuery` `isLoading` is true
- Mutations: No loading spinner — optimistic updates provide instant feedback
- Error recovery: Show error banner with option to retry

**Input Validation Patterns:**
- Frontend: Validate on submit, not on keystroke. Prevent empty/whitespace-only. Enforce 500-char max. Trim before sending. Inline error message below input.
- Backend: Fastify JSON Schema validates `description` (required, `minLength: 1`, `maxLength: 500`). Server trims whitespace before persisting. Validation runs before any DB interaction.

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow naming conventions exactly as specified — no variations
- Place tests in `__tests__/` directories, never co-located
- Use the standardized error response format for all API error paths
- Implement optimistic updates using the onMutate/onError/onSettled pattern
- Never expose server internals in error responses
- Use `camelCase` for JSON fields, `snake_case` for database columns

**Anti-Patterns to Avoid:**
- Mixing naming conventions (`userId` in one file, `user_id` in another)
- Returning `null` in API responses
- Using `PUT` instead of `PATCH` for partial updates
- Wrapping success responses in `{ data: ... }` envelopes
- Co-locating test files with source files
- Using raw SQL instead of Drizzle query builder
- Importing from `../../../` — use relative paths no deeper than two levels

## Project Structure & Boundaries

### Complete Project Directory Structure

```
bmad-todo-app/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── todo-page.tsx
│   │   │   ├── todo-input.tsx
│   │   │   ├── todo-list.tsx
│   │   │   ├── todo-item.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── loading-state.tsx
│   │   │   └── error-banner.tsx
│   │   ├── hooks/
│   │   │   └── use-todos.ts
│   │   ├── api/
│   │   │   └── todo-api.ts
│   │   └── types/
│   │       └── todo.ts
│   └── __tests__/
│       ├── components/
│       │   ├── todo-input.test.tsx
│       │   ├── todo-list.test.tsx
│       │   ├── todo-item.test.tsx
│       │   ├── empty-state.test.tsx
│       │   └── error-banner.test.tsx
│       ├── hooks/
│       │   └── use-todos.test.ts
│       └── api/
│           └── todo-api.test.ts
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── routes/
│   │   │   ├── todo-routes.ts
│   │   │   └── health-routes.ts
│   │   ├── db/
│   │   │   ├── connection.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── config/
│   │   │   └── env.ts
│   │   └── plugins/
│   │       ├── cors.ts
│   │       ├── static-files.ts
│   │       └── error-handler.ts
│   └── __tests__/
│       ├── routes/
│       │   ├── todo-routes.test.ts
│       │   └── health-routes.test.ts
│       └── db/
│           └── schema.test.ts
│
└── e2e/
    ├── playwright.config.ts
    ├── package.json
    └── tests/
        ├── todo-crud.spec.ts
        ├── todo-validation.spec.ts
        ├── todo-error-handling.spec.ts
        ├── todo-responsive.spec.ts
        └── todo-accessibility.spec.ts
```

### Architectural Boundaries

**API Boundary:**
The single boundary in this architecture is the HTTP contract between frontend and backend. The frontend communicates exclusively through `todo-api.ts` → Fastify routes. No direct DB access from the frontend. No shared runtime code between services.

```
[Browser] → fetch() → [Fastify API :3000/api/*] → Drizzle → [PostgreSQL :5432]
                       [Fastify Static :3000/*]  → built frontend files
```

**Component Boundaries — Frontend:**
- `todo-api.ts` is the only file that makes HTTP calls — components never call `fetch` directly
- `use-todos.ts` is the only hook that touches TanStack Query — components consume the hook's return values
- Components are purely presentational except `TodoPage` which orchestrates the hook

**Component Boundaries — Backend:**
- Route handlers in `routes/` are the only entry points for HTTP requests
- Route handlers call Drizzle directly (no service/repository layer for one entity)
- `plugins/` register cross-cutting Fastify plugins (CORS, error handler, static files)
- `db/schema.ts` is the single source of truth for the data model
- `config/env.ts` is the single source of truth for environment variables

**Data Boundary:**
- Drizzle schema (`db/schema.ts`) defines the database shape
- Drizzle handles `snake_case` (DB) ↔ `camelCase` (TypeScript) mapping
- API serialization uses camelCase JSON — no transformation layer needed

### Requirements to Structure Mapping

| FR Category | Frontend Location | Backend Location |
|---|---|---|
| Task Management (FR1-FR6) | `components/todo-input.tsx`, `todo-item.tsx`, `hooks/use-todos.ts` | `routes/todo-routes.ts`, `db/schema.ts` |
| Task Display & Status (FR7-FR9) | `components/todo-list.tsx`, `todo-item.tsx` | `routes/todo-routes.ts` (GET) |
| Input Validation (FR10-FR12) | `components/todo-input.tsx` | `routes/todo-routes.ts` (JSON Schema) |
| Data Persistence (FR13-FR15) | `api/todo-api.ts`, `hooks/use-todos.ts` | `db/connection.ts`, `db/schema.ts`, `db/migrations/` |
| UI State Management (FR16-FR20) | `components/empty-state.tsx`, `loading-state.tsx`, `error-banner.tsx`, `hooks/use-todos.ts` | `plugins/error-handler.ts` |
| Responsive Experience (FR21-FR24) | `index.css`, all component files (Tailwind classes) | — |
| Accessibility (FR25-FR28) | All component files (ARIA attrs, keyboard handlers) | — |
| API (FR29-FR31) | `api/todo-api.ts`, `types/todo.ts` | `routes/todo-routes.ts`, `routes/health-routes.ts` |

### Data Flow

```
User Action (click/type)
  → React Component (TodoInput / TodoItem)
    → useTodos hook (TanStack Query mutation)
      → onMutate: optimistic cache update
      → todo-api.ts: fetch() call
        → Fastify route handler
          → Fastify JSON Schema validation
          → Drizzle query → PostgreSQL
        ← JSON response (or error)
      → onSuccess: cache updated with server response
      → onError: rollback to snapshot, show ErrorBanner
      → onSettled: invalidate query
    ← UI re-renders from cache
```

### Development Workflow

**Local development (without Docker):**
1. Start PostgreSQL (Docker or local install)
2. `cd backend && npm run dev` — starts Fastify with watch mode on port 3000
3. `cd frontend && npm run dev` — starts Vite dev server on port 5173 with HMR
4. Frontend proxies API calls to backend (Vite proxy config)

**Production (Docker):**
1. `docker-compose up` — starts PostgreSQL + app container
2. App container builds frontend (`npm run build`), then starts Fastify
3. Fastify serves built static files on `/` and API on `/api/*`
4. Drizzle migrations run on startup

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are mutually compatible with no version conflicts. Vite + React 19 + TypeScript, Fastify 5.8 + Drizzle ORM + PostgreSQL 16, Tailwind CSS v4 + Vite plugin, Vitest 4.x + Vite, and TanStack Query + React 19 are all proven combinations in production use.

**Pattern Consistency:**
Naming conventions follow each layer's idiomatic standards: `snake_case` (database), `camelCase` (TypeScript/JSON), `kebab-case` (files), `PascalCase` (components/types). No convention crosses boundaries inappropriately.

**Structure Alignment:**
The 2-directory monorepo maps directly to the 2-container Docker topology. Test organization mirrors source structure. E2E tests are properly isolated. All architectural boundaries are reflected in the physical directory structure.

### Requirements Coverage ✅

All 31 functional requirements and 22 non-functional requirements have explicit architectural support. No FR or NFR is left without a defined component, pattern, or decision backing it.

### Implementation Readiness ✅

**Decision Completeness:** All critical and important decisions are documented with technology versions, rationale, and affected components.

**Structure Completeness:** Every file and directory is specified. Requirements are mapped to specific file locations.

**Pattern Completeness:** Naming, structure, format, and process patterns cover all identified conflict points with concrete examples and anti-patterns.

### Gap Analysis Results

**No critical gaps.** Two important observations for implementation:

1. **Type synchronization:** The `Todo` type is defined independently in frontend (`types/todo.ts`) and backend (Drizzle schema inference). These must stay manually synchronized. Acceptable for one entity; revisit if entities grow in Phase 2.
2. **Vite dev proxy:** Configure `/api` proxy in `vite.config.ts` to forward API calls to the Fastify backend during local development. Already implied by the development workflow but should be implemented explicitly.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Format patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — low-complexity project with well-understood technology choices, comprehensive patterns, and full requirements coverage.

**Key Strengths:**
- Minimal, proven technology stack with no unnecessary abstractions
- Every requirement explicitly mapped to architectural components
- Clear boundaries between frontend, backend, and database
- Comprehensive patterns prevent AI agent implementation conflicts
- Docker-first deployment with zero-config startup

**Areas for Future Enhancement (Phase 2+):**
- Shared TypeScript types package between frontend and backend
- CI/CD pipeline
- Authentication layer (designed to be additive, no rework needed)
- Root-level workspace scripts for cross-service commands

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
Project scaffolding — initialize Vite frontend, Fastify backend, Docker Compose with PostgreSQL, and Drizzle ORM schema.
