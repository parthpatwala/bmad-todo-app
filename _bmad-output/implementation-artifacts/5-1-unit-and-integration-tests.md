# Story 5.1: Unit & Integration Tests

Status: done

## Story

As a **developer**,
I want comprehensive unit and integration tests covering backend API routes and frontend components/hooks,
So that I have confidence the application works correctly and regressions are caught early.

## Acceptance Criteria

1. **Given** the backend test suite, **When** tests run via Vitest, **Then** all 4 CRUD route handlers are tested with success and error scenarios, **And** the health check endpoint is tested, **And** input validation edge cases are covered (empty description, too-long description, whitespace trimming), **And** 404 responses for non-existent todo ids are tested.

2. **Given** the frontend test suite, **When** tests run via Vitest with @testing-library/react, **Then** the TodoInput component is tested for submission and validation feedback, **And** the TodoItem component is tested for completion toggle and delete actions, **And** the TodoList component is tested for rendering a list of todos, **And** the EmptyState and ErrorBanner components are tested for correct rendering, **And** the useTodos hook is tested for query and mutation behavior.

3. **Given** all tests pass, **When** test coverage is measured, **Then** meaningful code coverage is at minimum 70% (unit + integration combined), **And** all tests are deterministic with no flaky results.

## Tasks / Subtasks

- [x] Task 1: Set up Vitest for the backend (AC: #1)
  - [x] 1.1 Install `vitest` as a devDependency in `backend/package.json`
  - [x] 1.2 Create `backend/vitest.config.ts` — no special env needed since tests use `fastify.inject()` (no HTTP server)
  - [x] 1.3 Add `"test"` and `"test:coverage"` scripts to `backend/package.json`
  - [x] 1.4 Create `backend/__tests__/` directory structure: `routes/`
- [x] Task 2: Write backend route tests (AC: #1)
  - [x] 2.1 Create `backend/__tests__/routes/health-routes.test.ts` — test GET /api/health returns 200 `{ status: 'ok' }`
  - [x] 2.2 Create `backend/__tests__/routes/todo-routes.test.ts` with these test cases:
    - GET /api/todos — returns 200 with empty array when no todos exist
    - POST /api/todos — returns 201 with created todo (valid description)
    - POST /api/todos — returns 400 for empty description
    - POST /api/todos — returns 400 for whitespace-only description
    - POST /api/todos — returns 400 for description over 500 chars
    - POST /api/todos — trims leading/trailing whitespace from description
    - POST /api/todos — returns 400 for missing description field
    - POST /api/todos — strips extra properties (additionalProperties: false — Fastify removes rather than rejects)
    - GET /api/todos — returns created todos ordered by createdAt ascending
    - PATCH /api/todos/:id — returns 200 with updated todo (toggle completed)
    - PATCH /api/todos/:id — returns 404 for non-existent id
    - PATCH /api/todos/:id — returns 400 for invalid id (non-integer)
    - PATCH /api/todos/:id — returns 400 for missing completed field
    - DELETE /api/todos/:id — returns 204 for existing todo
    - DELETE /api/todos/:id — returns 404 for non-existent id
    - Error responses match `{ error: string, message: string }` format
- [x] Task 3: Set up Vitest for the frontend (AC: #2)
  - [x] 3.1 Install devDependencies in `frontend/package.json`: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
  - [x] 3.2 Create `frontend/vitest.config.ts` with `environment: 'jsdom'` and setup file
  - [x] 3.3 Create `frontend/__tests__/setup.ts` — import `@testing-library/jest-dom/vitest` for custom matchers and `cleanup` from `@testing-library/react`
  - [x] 3.4 Add `"test"` and `"test:coverage"` scripts to `frontend/package.json`
  - [x] 3.5 Create `frontend/__tests__/` directory structure: `components/`, `hooks/`, `api/`
- [x] Task 4: Write frontend component tests (AC: #2)
  - [x] 4.1 Create `frontend/__tests__/components/empty-state.test.tsx` — renders "No todos yet" text
  - [x] 4.2 Create `frontend/__tests__/components/loading-state.test.tsx` — renders "Loading todos..." text
  - [x] 4.3 Create `frontend/__tests__/components/error-banner.test.tsx`:
    - Renders error message text
    - Renders Dismiss button, calls onDismiss when clicked
    - Renders Retry button when onRetry provided, calls onRetry when clicked
    - Does not render Retry button when onRetry not provided
    - Has role="alert" on container
  - [x] 4.4 Create `frontend/__tests__/components/todo-input.test.tsx`:
    - Renders input field and Add button
    - Calls onAdd with trimmed description on button click
    - Calls onAdd on Enter key press
    - Shows validation error for empty submission
    - Shows validation error for whitespace-only submission
    - Shows validation error for description over 500 characters
    - Clears input after successful submission
    - Displays server error when serverError prop is set
    - Clears server error on new submission (calls onClearServerError)
    - Shows character count
  - [x] 4.5 Create `frontend/__tests__/components/todo-item.test.tsx`:
    - Renders todo description
    - Shows line-through for completed todos
    - Calls onToggle when checkbox is clicked
    - Calls onToggle when Enter pressed on checkbox (keyboard handler)
    - Calls onDelete when delete button is clicked
    - Has aria-label on checkbox and delete button
  - [x] 4.6 Create `frontend/__tests__/components/todo-list.test.tsx`:
    - Renders a list of todos
    - Has aria-label with item count
    - Uses singular "item" for single todo
    - Renders correct number of TodoItem components
- [x] Task 5: Write frontend API client tests (AC: #2)
  - [x] 5.1 Create `frontend/__tests__/api/todo-api.test.ts`:
    - fetchTodos returns array on success
    - fetchTodos throws Error with server message on failure
    - fetchTodos throws default message on non-JSON error response
    - createTodo sends POST with description, returns todo
    - createTodo throws Error with server message on failure
    - toggleTodo sends PATCH with completed, returns todo
    - deleteTodo sends DELETE, resolves void
    - deleteTodo throws Error on failure
- [x] Task 6: Write useTodos hook tests (AC: #2)
  - [x] 6.1 Create `frontend/__tests__/hooks/use-todos.test.ts`:
    - Returns todos from query
    - Returns isLoading true while fetching
    - Returns isError true on fetch failure
    - addTodo calls createTodo mutation
    - toggleTodo calls toggleTodo mutation
    - deleteTodo calls deleteTodo mutation
- [x] Task 7: Verify coverage and validate (AC: #3)
  - [x] 7.1 Run backend tests with `--coverage` — verify 70%+ meaningful coverage (84.48% statements)
  - [x] 7.2 Run frontend tests with `--coverage` — verify 70%+ meaningful coverage (78.34% statements)
  - [x] 7.3 All tests are deterministic — run twice, same results
  - [x] 7.4 TypeScript compiles with zero errors in both frontend and backend

### Review Findings

- [x] [Review][Patch] TodoItem test asserts CSS class (line-through) — replaced with behavior-based checked/unchecked assertions [frontend/__tests__/components/todo-item.test.tsx]
- [x] [Review][Patch] toggleTodo API client has no failure-path test — added JSON error and non-JSON error tests [frontend/__tests__/api/todo-api.test.ts]
- [x] [Review][Patch] GET /api/todos has no error-path test — added 500 error test when db query fails [backend/__tests__/routes/todo-routes.test.ts]
- [x] [Review][Patch] deleteError not tested in TodoPage — added delete error banner test [frontend/__tests__/components/todo-page.test.tsx]
- [x] [Review][Defer] Coverage thresholds not enforced in vitest config — no `coverage.thresholds` setting; manual verification passes but CI won't gate [backend/vitest.config.ts, frontend/vitest.config.ts] — deferred, not required by AC3
- [x] [Review][Defer] orderBy arguments never asserted on mock chain — mock verifies chain is called but not with correct Drizzle ORM arguments [backend/__tests__/routes/todo-routes.test.ts] — deferred, inherent mock limitation
- [x] [Review][Defer] Mutation error fields and rollback stay untested in useTodos — hook tests verify mutations fire but don't verify error fields or optimistic rollback [frontend/__tests__/hooks/use-todos.test.ts] — deferred, complex async orchestration needed
- [x] [Review][Defer] Frontend API tests missing network error tests (fetch throws) — tests mock fetch to return error responses but never test fetch itself rejecting [frontend/__tests__/api/todo-api.test.ts] — deferred, source code has no explicit network error handling

## Dev Notes

### Previous Story Intelligence (Epics 1–4)

**Current codebase — no tests exist yet:**
- No `__tests__/` directories in either frontend or backend
- No test dependencies installed (no vitest, no @testing-library)
- No vitest.config files
- No test scripts in package.json for either service

**Backend architecture for testing:**
- `buildApp()` in `app.ts` creates and returns a Fastify instance — ideal for `fastify.inject()` testing
- Route handlers call Drizzle ORM directly (`db.select()`, `db.insert()`, etc.) against real PostgreSQL
- The `db` object is imported from `db/connection.ts` which connects via `DATABASE_URL` env var
- For integration tests: use `fastify.inject()` against a real test database OR mock the Drizzle `db` object
- Error handler is registered as a `fastify-plugin` — it applies to all routes including schema validation errors
- JSON Schema validation on POST/PATCH body is handled by Fastify automatically

**Frontend architecture for testing:**
- Components are purely presentational except `TodoPage` which orchestrates the `useTodos` hook
- `TodoInput` manages its own validation state internally
- `use-todos.ts` wraps all TanStack Query logic (queries + 3 mutations with optimistic updates)
- `todo-api.ts` contains all `fetch()` calls — 4 functions, each with error handling
- Components import from relative paths no deeper than two levels

### Backend Testing Strategy

**Use `fastify.inject()` for route integration tests** — this is Fastify's built-in testing approach. It simulates HTTP requests in-process without starting an actual server. No supertest needed.

**Database strategy for backend tests:** The backend route handlers call the Drizzle `db` directly. Two approaches:
1. **Mock the Drizzle `db` module** — use `vi.mock('../db/connection.js')` to mock the `db` export. This keeps tests fast and isolated from PostgreSQL.
2. **Use a real test database** — run against a test PostgreSQL instance. This provides more realistic testing but requires DB infrastructure.

**Recommended: Mock the `db` module** for unit/integration tests in this story. Mock `db.select()`, `db.insert()`, `db.update()`, `db.delete()` with chainable methods that return expected data. This avoids the need for a running PostgreSQL instance and keeps tests deterministic.

**Pattern for mocking Drizzle queries:**

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../../src/app.js';

// Mock the db module
vi.mock('../../src/db/connection.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  pool: { end: vi.fn() },
  runMigrations: vi.fn(),
}));

// Import the mocked db after vi.mock
import { db } from '../../src/db/connection.js';

// For chainable Drizzle methods:
// db.select().from(todos).orderBy(asc(todos.createdAt))
// Mock as: db.select.mockReturnValue({ from: vi.fn().mockReturnValue({ orderBy: vi.fn().mockResolvedValue([...]) }) })
```

**Also mock the health check's `db.execute()`:**

```typescript
vi.mock('../../src/db/connection.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(), // for health check's sql`SELECT 1`
  },
  pool: { end: vi.fn() },
  runMigrations: vi.fn(),
}));
```

### Frontend Testing Strategy

**Component tests:** Use `@testing-library/react` with `render`, `screen`, `fireEvent`/`userEvent`. For components that don't depend on TanStack Query (`EmptyState`, `LoadingState`, `ErrorBanner`, `TodoItem`, `TodoList`), render directly with props.

**TodoInput tests:** This component uses internal `useState` — render and interact via user events. Mock the `onAdd`, `onClearServerError` callbacks with `vi.fn()`.

**API client tests (`todo-api.ts`):** Mock `global.fetch` with `vi.fn()` to simulate success/error responses. Test each exported function independently.

**useTodos hook tests:** Use `renderHook` from `@testing-library/react` wrapped in a `QueryClientProvider`. Create a fresh `QueryClient` per test with `retry: false` to prevent retries. Mock `fetch` globally to control API responses.

**QueryClient setup for tests:**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

### Vitest Configuration

**Backend `vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts'],
    },
  },
});
```

Exclude `server.ts` from coverage — it's the entry point with `process.exit()` calls, not meaningfully unit-testable.

**Frontend `vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/index.css'],
    },
  },
});
```

Exclude `main.tsx` (bootstrap) and `index.css` from coverage.

**Frontend setup file (`frontend/__tests__/setup.ts`):**

```typescript
import '@testing-library/jest-dom/vitest';
```

This registers custom matchers like `toBeInTheDocument()`, `toHaveTextContent()`, etc.

### Test File Locations (MUST FOLLOW)

Architecture mandates: tests in `__tests__/` directories, NEVER co-located.

```
backend/
├── __tests__/
│   └── routes/
│       ├── health-routes.test.ts
│       └── todo-routes.test.ts
│
frontend/
├── __tests__/
│   ├── setup.ts
│   ├── components/
│   │   ├── empty-state.test.tsx
│   │   ├── loading-state.test.tsx
│   │   ├── error-banner.test.tsx
│   │   ├── todo-input.test.tsx
│   │   ├── todo-item.test.tsx
│   │   └── todo-list.test.tsx
│   ├── hooks/
│   │   └── use-todos.test.ts
│   └── api/
│       └── todo-api.test.ts
```

### Files to Create

| File | Purpose |
|------|---------|
| `backend/vitest.config.ts` | Vitest config for backend |
| `backend/__tests__/routes/health-routes.test.ts` | Health endpoint tests |
| `backend/__tests__/routes/todo-routes.test.ts` | Todo CRUD route tests |
| `frontend/vitest.config.ts` | Vitest config for frontend |
| `frontend/__tests__/setup.ts` | Test setup (jest-dom matchers) |
| `frontend/__tests__/components/empty-state.test.tsx` | EmptyState tests |
| `frontend/__tests__/components/loading-state.test.tsx` | LoadingState tests |
| `frontend/__tests__/components/error-banner.test.tsx` | ErrorBanner tests |
| `frontend/__tests__/components/todo-input.test.tsx` | TodoInput tests |
| `frontend/__tests__/components/todo-item.test.tsx` | TodoItem tests |
| `frontend/__tests__/components/todo-list.test.tsx` | TodoList tests |
| `frontend/__tests__/hooks/use-todos.test.ts` | useTodos hook tests |
| `frontend/__tests__/api/todo-api.test.ts` | API client tests |

### Files to Modify

| File | Changes |
|------|---------|
| `backend/package.json` | Add vitest devDependency, test scripts |
| `frontend/package.json` | Add vitest, @testing-library/*, jsdom devDependencies, test scripts |

### Files NOT to Modify

- NO source code files — this story only adds tests and test infrastructure
- NO backend route/plugin/config files
- NO frontend component/hook/api files
- NO docker or deployment files

### Naming Conventions (MUST FOLLOW)

- Test files: `kebab-case` matching source → `todo-routes.test.ts`, `todo-input.test.tsx`
- Test descriptions: `describe('TodoInput')`, `it('renders input field and Add button')`
- Test helpers: `camelCase` → `createTestQueryClient`, `createWrapper`
- Mock factories: `camelCase` → `mockFetch`, `mockDb`

### Critical Project Configuration

- React 19.x, TypeScript strict mode, ESM (`"type": "module"`)
- Backend: Fastify 5.8, Drizzle ORM, `fastify-plugin` for error handler/cors
- Frontend: Vite 8, Tailwind CSS v4, TanStack Query v5
- Coverage target: 70% minimum (unit + integration combined)
- Test framework: Vitest (latest stable)
- Tests MUST be in `__tests__/` directories, never co-located

### Scope Boundaries — What NOT to Do

- Do NOT write E2E/Playwright tests — that is Story 5.2
- Do NOT modify any source code — only add test files and config
- Do NOT test the Docker deployment — that is Story 5.3
- Do NOT add snapshot tests — use assertion-based tests
- Do NOT test CSS/Tailwind classes — test behavior, not styles
- Do NOT test `server.ts` entry point — it requires process management
- Do NOT test `main.tsx` — it's bootstrap code

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5, Story 5.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Testing Standards]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns — Test Organization]
- [Source: Vitest documentation — fastify.inject() for route testing]
- [Source: TanStack Query testing guide — QueryClient setup with retry: false]
- [Source: @testing-library/react — render, screen, fireEvent, renderHook]

## Dev Agent Record

### Agent Model Used
Claude (via Cursor)

### Debug Log References
- Backend test for `additionalProperties: false` initially expected 400 but Fastify 5 strips extra properties via `removeAdditional` rather than rejecting. Adjusted test to verify stripping behavior (201 returned with valid fields only).

### Completion Notes List
- Installed Vitest + @vitest/coverage-v8 in backend; created `vitest.config.ts` with v8 coverage excluding `server.ts`
- Created 18 backend tests (2 health, 16 todo CRUD) using `fastify.inject()` with mocked Drizzle `db` module
- Installed Vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, @vitest/coverage-v8 in frontend
- Created `vitest.config.ts` with jsdom environment and `__tests__/setup.ts` for jest-dom matchers
- Created 51 frontend tests across 9 test files:
  - 6 component test suites (EmptyState, LoadingState, ErrorBanner, TodoInput, TodoItem, TodoList)
  - 1 TodoPage integration test suite (mocking useTodos hook)
  - 1 API client test suite (mocking global.fetch)
  - 1 useTodos hook test suite (with QueryClientProvider wrapper)
- Backend coverage: **84.48%** statements / **84.48%** lines (routes at 100%)
- Frontend coverage: **78.34%** statements / **79.86%** lines
- All 69 tests (18 backend + 51 frontend) pass deterministically
- TypeScript compiles with zero errors in both projects

### Change Log
- 2026-03-31: Implemented Story 5.1 — full test infrastructure and comprehensive test suites for backend and frontend

### File List
**New files:**
- `backend/vitest.config.ts`
- `backend/__tests__/routes/health-routes.test.ts`
- `backend/__tests__/routes/todo-routes.test.ts`
- `frontend/vitest.config.ts`
- `frontend/__tests__/setup.ts`
- `frontend/__tests__/components/empty-state.test.tsx`
- `frontend/__tests__/components/loading-state.test.tsx`
- `frontend/__tests__/components/error-banner.test.tsx`
- `frontend/__tests__/components/todo-input.test.tsx`
- `frontend/__tests__/components/todo-item.test.tsx`
- `frontend/__tests__/components/todo-list.test.tsx`
- `frontend/__tests__/components/todo-page.test.tsx`
- `frontend/__tests__/hooks/use-todos.test.ts`
- `frontend/__tests__/api/todo-api.test.ts`

**Modified files:**
- `backend/package.json` — added vitest, @vitest/coverage-v8 devDeps; test and test:coverage scripts
- `frontend/package.json` — added vitest, @testing-library/*, jsdom, @vitest/coverage-v8 devDeps; test and test:coverage scripts
