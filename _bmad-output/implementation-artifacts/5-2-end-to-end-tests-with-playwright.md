# Story 5.2: End-to-End Tests with Playwright

Status: done

## Story

As a **developer**,
I want end-to-end tests that exercise the full user flow through a real browser against a running instance,
So that I can verify the entire stack works together from the user's perspective.

## Acceptance Criteria

1. **Given** a running instance of the application (frontend + backend + database), **When** the Playwright test suite runs, **Then** at minimum 5 tests pass covering the core flows listed below.

2. **Given** the app is loaded with no todos, **When** the user creates a todo, **Then** it appears in the list (tests: todo creation).

3. **Given** a todo exists, **When** the user marks it complete and then incomplete, **Then** the visual state toggles correctly (tests: completion toggle).

4. **Given** a todo exists, **When** the user deletes it, **Then** it is removed from the list (tests: deletion).

5. **Given** the user submits an empty description, **When** the validation runs, **Then** an inline error is displayed and no todo is created (tests: input validation).

6. **Given** todos have been created, **When** the user refreshes the page, **Then** all todos persist and are displayed (tests: data persistence).

## Tasks / Subtasks

- [x] Task 1: Install Playwright and set up test infrastructure (AC: #1)
  - [x] 1.1 Run `npm install` in `e2e/` to install `@playwright/test` dependency (package.json already exists)
  - [x] 1.2 Install Playwright browsers via `npx playwright install chromium` (chromium only for speed)
  - [x] 1.3 Update `e2e/playwright.config.ts` — add `webServer` config to auto-start frontend and backend, set `baseURL` to `http://localhost:5173`, add project for chromium only
  - [x] 1.4 Create `e2e/tests/` directory for test spec files
  - [x] 1.5 Add `"test:e2e"` script to root-level approach (or document the `cd e2e && npx playwright test` command)
- [x] Task 2: Write todo creation E2E test (AC: #2)
  - [x] 2.1 Create `e2e/tests/todo-crud.spec.ts` with test: user types description in input, clicks Add (or presses Enter), todo appears in the list
  - [x] 2.2 Assert the new todo text is visible in the list after creation
- [x] Task 3: Write completion toggle E2E test (AC: #3)
  - [x] 3.1 In `todo-crud.spec.ts`, add test: create a todo, click the checkbox to mark complete, verify visual change (checkbox becomes checked)
  - [x] 3.2 Click checkbox again to mark incomplete, verify checkbox is unchecked
- [x] Task 4: Write deletion E2E test (AC: #4)
  - [x] 4.1 In `todo-crud.spec.ts`, add test: create a todo, click the Delete button, verify todo is removed from the list
- [x] Task 5: Write input validation E2E test (AC: #5)
  - [x] 5.1 Create `e2e/tests/todo-validation.spec.ts` with test: click Add with empty input, verify inline error message "Description cannot be empty" appears
  - [x] 5.2 Verify no todo is created in the list
- [x] Task 6: Write data persistence E2E test (AC: #6)
  - [x] 6.1 In `todo-crud.spec.ts`, add test: create a todo, reload the page, verify the todo is still displayed
- [x] Task 7: Database cleanup and test isolation (AC: #1)
  - [x] 7.1 Implement test isolation — each test should start with a clean state. Use the API directly (`page.request`) to clean up todos before each test via `DELETE /api/todos/:id` after fetching the list via `GET /api/todos`
  - [x] 7.2 Verify all tests pass in sequence and in isolation (run twice, deterministic)

### Review Findings

- [x] [Review][Defer] `beforeEach` cleanup doesn't assert GET/DELETE response status [e2e/tests/todo-crud.spec.ts:3-11] — deferred, defensive coding improvement
- [x] [Review][Defer] Duplicated `beforeEach` block across two spec files [e2e/tests/todo-crud.spec.ts, e2e/tests/todo-validation.spec.ts] — deferred, DRY improvement
- [x] [Review][Defer] Story task 1.5 root-level `test:e2e` script not added to root package.json — deferred, documented in dev record instead

## Dev Notes

### Previous Story Intelligence (Story 5.1)

**Learnings from Story 5.1:**
- Vitest + @testing-library/react setup is complete for unit/integration tests — E2E tests are a separate concern
- Backend uses `fastify.inject()` for route tests with mocked DB — E2E tests will hit the REAL backend + DB
- Fastify 5 strips extra `additionalProperties` rather than rejecting (201 not 400) — relevant if E2E tests check schema behavior
- All 74 unit/integration tests pass (19 backend + 55 frontend)
- `e2e/` directory already scaffolded with `playwright.config.ts` and `package.json`

**Existing E2E scaffold:**
- `e2e/package.json` has `@playwright/test: ^1` as devDependency
- `e2e/playwright.config.ts` already configured with `baseURL: 'http://localhost:5173'`, `testDir: './tests'`, `fullyParallel: true`
- No test files exist yet in `e2e/tests/`

### E2E Testing Strategy

**CRITICAL: These are REAL browser tests against a RUNNING instance.**

Unlike Story 5.1 (unit tests with mocks), E2E tests require:
1. PostgreSQL database running (via docker-compose or local)
2. Backend running on port 3000
3. Frontend dev server running on port 5173 (Vite proxy to backend)

**Playwright `webServer` configuration** should auto-start both frontend and backend. Recommended approach:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,  // Run serially for DB state predictability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,  // Single worker to avoid DB race conditions
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});
```

**IMPORTANT:** The `webServer` config starts both servers but does NOT start PostgreSQL. The developer MUST have PostgreSQL running (via `docker-compose up db` or local install) before running E2E tests.

### Test Isolation Strategy

**Each test must start with a clean todo list.** Use `beforeEach` to clear all todos via the API:

```typescript
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Clean up all todos via API
  const response = await page.request.get('/api/todos');
  const todos = await response.json();
  for (const todo of todos) {
    await page.request.delete(`/api/todos/${todo.id}`);
  }
  await page.goto('/');
});
```

### UI Selectors Strategy

Use accessible selectors (role, label, text) — consistent with how @testing-library works in unit tests:
- Input: `page.getByLabel('New todo description')`
- Add button: `page.getByRole('button', { name: /add todo/i })`
- Todo text: `page.getByText('Buy groceries')`
- Checkbox: `page.getByRole('checkbox', { name: /mark "Buy groceries"/i })`
- Delete button: `page.getByRole('button', { name: /delete "Buy groceries"/i })`
- Error message: `page.getByText('Description cannot be empty')`

### Architecture Compliance

- E2E tests go in `e2e/tests/` directory at project root (per architecture spec)
- Test files use `.spec.ts` extension (Playwright convention)
- File names: `kebab-case` matching feature → `todo-crud.spec.ts`, `todo-validation.spec.ts`
- Only chromium browser needed for MVP (architecture doesn't mandate cross-browser)
- NFR21 requires "Minimum 5 Playwright end-to-end tests pass" — we need exactly 5+

### Files to Create

| File | Purpose |
|------|---------|
| `e2e/tests/todo-crud.spec.ts` | Creation, toggle, deletion, persistence tests |
| `e2e/tests/todo-validation.spec.ts` | Input validation E2E test |

### Files to Modify

| File | Changes |
|------|---------|
| `e2e/playwright.config.ts` | Add webServer config, set workers: 1, add chromium project |
| `e2e/package.json` | Potentially add test:e2e script |

### Files NOT to Modify

- NO source code files (frontend or backend)
- NO unit test files from Story 5.1
- NO Docker configuration (that is Story 5.3)
- NO vitest config files

### Naming Conventions (MUST FOLLOW)

- Test files: `kebab-case.spec.ts` → `todo-crud.spec.ts`, `todo-validation.spec.ts`
- Test descriptions: `test.describe('Todo CRUD')`, `test('creates a new todo')`
- Test helpers: `camelCase` → `cleanupTodos`

### Critical Project Configuration

- React 19.x, TypeScript strict mode, ESM (`"type": "module"`)
- Backend: Fastify 5.8 on port 3000
- Frontend: Vite 8 on port 5173 with `/api` proxy to backend
- PostgreSQL 16 must be running (docker-compose or local)
- Playwright `@playwright/test: ^1`
- Tests MUST be in `e2e/tests/` directory
- NFR21: Minimum 5 E2E tests required
- NFR22: Tests must be deterministic (no flaky results)

### Scope Boundaries — What NOT to Do

- Do NOT write unit/integration tests — that was Story 5.1
- Do NOT modify any source code — only add E2E test files and update config
- Do NOT configure Docker deployment — that is Story 5.3
- Do NOT test responsive design in E2E — keep tests focused on core flows
- Do NOT test accessibility in E2E — WCAG compliance was verified in Epic 4
- Do NOT add more than chromium browser — MVP doesn't need cross-browser
- Do NOT use snapshot testing — use assertion-based verification

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5, Story 5.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns — Test Organization]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure — e2e/ directory]
- [Source: _bmad-output/planning-artifacts/architecture.md#NFR21 — Minimum 5 E2E tests]
- [Source: e2e/playwright.config.ts — existing scaffold with baseURL and testDir]
- [Source: e2e/package.json — existing @playwright/test dependency]

## Dev Agent Record

### Agent Model Used
Claude (via Cursor)

### Debug Log References
- Playwright `check()` method fails on React-managed checkboxes (optimistic updates via TanStack Query). The native `check()` clicks the checkbox but React reconciles state asynchronously, causing Playwright to see no state change. Fixed by using `click()` + `expect(checkbox).toBeChecked()` assertions instead.
- Sandbox `PLAYWRIGHT_BROWSERS_PATH` env var caused x64 browsers to be downloaded on arm64 machine. Resolved by unsetting the env var and reinstalling via standard path (`~/Library/Caches/ms-playwright/`).
- ARIA live region `<div aria-live="polite">Todo added: Buy groceries</div>` caused `getByText('Buy groceries')` to match 2 elements (todo item span + live region). Fixed by scoping assertions to `page.getByRole('list', { name: /todo list/i })`.

### Completion Notes List
- Installed `@playwright/test` dependencies in `e2e/` and Chromium browser
- Updated `e2e/playwright.config.ts` with `webServer` config (auto-starts backend on port 3000, frontend on port 5173), serial execution (`workers: 1`, `fullyParallel: false`), chromium-only project
- Created 5 E2E tests across 2 spec files:
  - `todo-crud.spec.ts`: 4 tests (creation, toggle, deletion, persistence)
  - `todo-validation.spec.ts`: 1 test (empty input validation)
- Implemented test isolation via `beforeEach` — cleans all todos via API (`GET /api/todos` → `DELETE /api/todos/:id`) before each test
- All 5 E2E tests pass deterministically (verified across 2 consecutive runs)
- All 74 existing unit/integration tests pass (19 backend + 55 frontend) — no regressions
- No source code files were modified

### Change Log
- 2026-03-31: Implemented Story 5.2 — Playwright E2E test suite with 5 tests covering all core user flows

### File List
**New files:**
- `e2e/tests/todo-crud.spec.ts`
- `e2e/tests/todo-validation.spec.ts`

**Modified files:**
- `e2e/playwright.config.ts` — added webServer config, chromium project, serial execution
- `e2e/package-lock.json` — generated from npm install
