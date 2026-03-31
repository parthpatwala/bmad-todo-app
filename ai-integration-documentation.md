# AI Integration Documentation

**Project:** bmad-todo-app
**BMAD Version:** 6.2.2
**Date:** 2026-03-31
**Model Used:** Claude claude-4.6-opus-high (via Cursor IDE)

---

## 1. Agent Usage

### Which tasks were completed with AI assistance?

Every task in this project was completed with AI assistance through BMAD agent personas. The methodology assigned specialized personas to each phase:

| Phase | BMAD Agent | Skill Used | Tasks Completed |
|-------|-----------|------------|-----------------|
| Requirements | John (Product Manager) | `bmad-create-prd` | Full PRD with 31 functional requirements and 10 non-functional requirements across a 12-step guided workflow |
| Architecture | Winston (Architect) | `bmad-create-architecture` | Technology stack selection (React 19 + Vite, Fastify 5, PostgreSQL 16, Drizzle ORM, TanStack Query, Tailwind v4), API contract design, deployment topology, project structure |
| Epic/Story Breakdown | Bob (Scrum Master) | `bmad-create-epics-and-stories` | 5 epics, 11 stories with BDD-style acceptance criteria mapped to functional requirements |
| Sprint Planning | Bob (Scrum Master) | `bmad-sprint-planning` | Sprint status YAML tracking file with lifecycle states |
| Story Creation | Bob (Scrum Master) | `bmad-create-story` (x11) | Detailed story files with acceptance criteria, task breakdowns, dev notes, file lists, naming conventions, and scope boundaries |
| Implementation | Amelia (Developer) | `bmad-dev-story` (x11) | Full implementation of all 11 stories: scaffolding, API CRUD, UI components, validation, error states, responsive layout, accessibility, unit/integration tests, E2E tests, Docker production build |
| Code Review | Adversarial Reviewers | `bmad-code-review` (x11) | 3-layer parallel review per story (Blind Hunter, Edge Case Hunter, Acceptance Auditor) with triage into patch/decision/defer/dismiss |
| Security Review | — | Ad-hoc AI audit | Static security review of backend, frontend, Docker, and environment configuration |

### What prompts worked best?

The BMAD methodology abstracts away manual prompt engineering — the skills contain pre-built prompts and workflows. The most effective patterns observed were:

- **"Create the next story"** — Triggers `bmad-create-story`, which automatically reads the epic backlog, architecture docs, and incorporates "Previous Story Intelligence" from completed stories. This context-gathering is handled by the skill, not the user.
- **"Dev this story [story-file]"** — Triggers `bmad-dev-story`, which reads the story file as its complete specification. The developer agent follows the task checklist, acceptance criteria, and naming conventions from the story file without needing additional prompts.
- **"Run code review"** — Triggers `bmad-code-review`, which launches 3 parallel subagents with different review perspectives. No additional instructions needed.
- **"Run sprint planning"** — Generates the `sprint-status.yaml` tracking file from the epics document.

The key insight is that BMAD's value lies in the **structured artifact chain** (PRD → Architecture → Epics → Stories → Implementation → Review), not in individual prompt crafting. Each skill reads from prior artifacts, so the context compounds automatically.

### Chat Sessions Used

The project was executed across approximately 8 chat sessions:

1. **BMAD orientation and PRD start** — Used `bmad-help` to understand the workflow, then began PRD creation with John (PM)
2. **PRD creation** — Full 12-step PRD workflow with the Product Manager
3. **PRD continuation** — Two additional short sessions resuming incomplete PRD state
4. **Architecture design** — Full architecture workshop with Winston (Architect): stack choices, API contract, Docker topology, validation
5. **Epics/stories and sprint planning** — Bob (SM) created the epic/story breakdown, followed by sprint planning and an extended Q&A on BMAD workflow mechanics (story creation vs development, fresh chats, batch vs sequential)
6. **Main build session** — The core implementation session covering all 11 stories: create-story → dev-story → code-review cycles, plus Phase 3 QA activities (security review, Lighthouse, Docker hardening, coverage reporting, methodology report)
7. **MCP-driven validation** — API contract validation, E2E user journeys, and frontend DevTools inspection using MCP servers
8. **AI integration documentation** — This document

---

## 2. MCP Server Usage

Three MCP servers were used during Phase 3 for validation and testing activities that extended beyond what the BMAD story lifecycle covered:

### 2.1 API Testing MCP (`api-testing-mcp`)

**Purpose:** Validate the live API against the contract defined in `architecture.md`.

**How it helped:**
- Executed **24 API contract tests** against the running backend with a real PostgreSQL database, covering all 5 endpoints (health, GET/POST/PATCH/DELETE todos)
- Validated error response format compliance — all errors conform to the `{ error, message }` shape defined in `error-handler.ts`
- Ran a **6-step multi-step CRUD flow** (POST → GET → PATCH → GET → DELETE → GET) to verify state persistence across sequential operations
- Discovered that the health endpoint's 503 failure path uses a non-standard response shape (`{ status, error }` instead of `{ error, message }`) — documented as by-design since the health endpoint bypasses the global error handler

**Report:** [`_bmad-output/implementation-artifacts/api-contract-validation.md`](_bmad-output/implementation-artifacts/api-contract-validation.md)

| Category | Tests | Passed | Failed |
|---|---|---|---|
| GET /api/health | 1 | 1 | 0 |
| GET /api/todos | 4 | 4 | 0 |
| POST /api/todos | 7 | 7 | 0 |
| PATCH /api/todos/:id | 4 | 4 | 0 |
| DELETE /api/todos/:id | 2 | 2 | 0 |
| CRUD Flow (6-step) | 6 | 6 | 0 |
| **Total** | **24** | **24** | **0** |

**Relationship to automated tests:** This supplements the unit tests in `backend/__tests__/routes/` which use mocked DB calls via `app.inject()`. The MCP validation confirmed end-to-end behavior against a live database.

### 2.2 Playwright MCP (`@playwright/mcp`)

**Purpose:** Execute interactive E2E user journeys with step-by-step browser automation and screenshot capture.

**How it helped:**
- Performed **6 user journeys** covering: empty state, create todo, complete todo, delete todo, input validation, and network failure/recovery
- Captured **9 screenshots** documenting each UI state for the deliverable
- Validated **14 functional requirements** (FR1, FR2, FR3, FR5, FR7, FR8, FR9, FR10, FR12, FR16, FR18, FR19, FR26, FR28) through actual browser interaction
- Verified accessibility in-browser: ARIA live region announcements, dynamic labels, `role="alert"` on errors, focus management after add/delete
- Simulated network failure via `page.route()` abort to test error handling and recovery flow (TanStack Query retry behavior observed: ~8 second delay before error banner due to 3 retries with exponential backoff)

**Report:** [`_bmad-output/implementation-artifacts/e2e-user-journey-report.md`](_bmad-output/implementation-artifacts/e2e-user-journey-report.md)

**Observations:**
- Validation error persistence during corrective typing was noted as a valid UX pattern (clears on next successful submit, matching Story 2.1 AC)
- All user journeys passed — zero issues found

### 2.3 Chrome DevTools MCP (`chrome-devtools-mcp`)

**Purpose:** Deep frontend inspection — DOM structure, network requests, console messages, Lighthouse audits, performance metrics, and responsive layout verification.

**How it helped:**
- **DOM & Semantic HTML:** Verified the full accessibility tree structure with 10 checks (heading hierarchy, ARIA labels, list structure, live region, label wrappers)
- **ARIA Attributes:** Validated 9 ARIA implementation points from Stories 4.1 and 4.2
- **Network Inspection:** Captured and validated 3 API requests (GET, POST, refetch) confirming contract compliance, Vite proxy functionality, camelCase JSON fields, ISO 8601 timestamps, and TanStack Query refetch behavior
- **Console Messages:** Confirmed zero React errors/warnings, zero deprecation notices, zero StrictMode issues. One minor Chrome DevTools suggestion (form field missing `id`/`name` — cosmetic, not a functional or accessibility issue)
- **Lighthouse Accessibility:** Scored **93/100** desktop and mobile. Found 2 actionable issues:
  - `color-contrast` on character counter (2.48:1 ratio) — documented as acceptable in Story 4.2 (WCAG exemption for decorative/supplementary text)
  - `landmark-one-main` — missing `<main>` element in `App.tsx` (simple fix, not caught during Story 4.2 implementation)
- **Performance Metrics:** LCP 390ms, CLS 0.00, TTFB 6ms, API responses ~18ms — all within NFR targets
- **Responsive Layout:** Verified desktop (1024x768) and mobile (375x812) layouts with screenshots, confirmed 44px touch targets on all interactive elements

**Report:** [`_bmad-output/implementation-artifacts/frontend-devtools-inspection.md`](_bmad-output/implementation-artifacts/frontend-devtools-inspection.md)

| Category | Tests | Pass | Fail | Warn | Info |
|---|---|---|---|---|---|
| DOM & Semantic HTML | 10 | 10 | 0 | 0 | 0 |
| ARIA Attributes | 9 | 9 | 0 | 0 | 0 |
| Network Requests | 10 | 10 | 0 | 0 | 0 |
| Console Messages | 4 | 3 | 0 | 1 | 0 |
| Lighthouse A11Y | 2 | 0 | 2 | 0 | 0 |
| Lighthouse SEO | 2 | 0 | 0 | 0 | 2 |
| Performance | 4 | 3 | 0 | 0 | 1 |
| Responsive Layout | 8 | 8 | 0 | 0 | 0 |
| **Total** | **51** | **45** | **2** | **1** | **3** |

### MCP Server Summary

| MCP Server | Tests/Checks | Key Finding |
|---|---|---|
| API Testing | 24 passed, 0 failed | Full API contract compliance with architecture.md |
| Playwright | 6 journeys, 14 FRs covered, 9 screenshots | All journeys passed, accessibility verified in-browser |
| Chrome DevTools | 51 checks (45 pass, 2 fail, 1 warn, 3 info) | Lighthouse 93 a11y, missing `<main>` landmark, sub-400ms LCP |

---

## 3. Test Generation

### How did AI assist in generating test cases?

Test generation was handled through two BMAD stories and supplemented by MCP server validation:

**Story 5.1 — Unit and Integration Tests (Vitest)**

- AI generated **18 backend route tests** using mocked Drizzle database calls, covering all CRUD operations, validation paths, and error responses
- AI generated **51 frontend tests** across 9 test files: component rendering, API layer mocking, hook behavior, and page-level integration
- Final coverage: 77.94% backend statements, 82.16% frontend statements (both exceeding the 70% threshold from the PRD)
- AI correctly tested Fastify's `additionalProperties: false` + `removeAdditional: true` behavior — initially wrote a test expecting 400 on extra properties, then adjusted when it discovered Fastify strips extras rather than rejecting them

**Story 5.2 — End-to-End Tests (Playwright)**

- AI generated **5 E2E tests** across 2 spec files covering the core CRUD workflow and input validation
- AI implemented `beforeEach` API cleanup to ensure test isolation
- Configured Playwright with serial execution and `workers: 1` for database consistency

**MCP-driven validation (Phase 3, outside BMAD)**

- **API Testing MCP** added 24 live contract tests that the unit test mocks couldn't cover (real DB, real HTTP, multi-step flows)
- **Playwright MCP** executed 6 interactive user journeys with screenshot evidence covering 14 functional requirements
- **Chrome DevTools MCP** ran Lighthouse audits, performance metrics, and 51 DOM/network/console checks

**Story-level acceptance testing** — During each `bmad-dev-story` execution, the developer agent verified acceptance criteria through manual testing (curl commands for API, visual verification for UI).

### What did AI miss in test generation?

The `bmad-code-review` skill caught several gaps that the developer agent missed during test creation:

| Gap | Found By | Status |
|-----|----------|--------|
| TodoItem test asserted CSS classes instead of behavior | Acceptance Auditor (5.1 review) | **Patched** |
| Missing `toggleTodo` failure path tests | Acceptance Auditor (5.1 review) | **Patched** |
| Missing GET 500 error path test | Edge Case Hunter (5.1 review) | **Patched** |
| Missing TodoPage delete error banner test | Acceptance Auditor (5.1 review) | **Patched** |
| No coverage thresholds enforced in vitest config | Edge Case Hunter (5.1 review) | Deferred |
| Mock chain doesn't assert Drizzle `orderBy` arguments | Edge Case Hunter (5.1 review) | Deferred — inherent limitation of mocking chainable APIs |
| `useTodos` hook tests don't cover `addError`/`toggleError`/`deleteError` fields or rollback | Edge Case Hunter (5.1 review) | Deferred |
| No `fetch` rejection tests (network failure) | Edge Case Hunter (5.1 review) | Deferred |
| `beforeEach` cleanup doesn't assert response status | Edge Case Hunter (5.2 review) | Deferred |
| Duplicated cleanup block across spec files | Blind Hunter (5.2 review) | Deferred |
| Root-level `test:e2e` script not added to package.json | Acceptance Auditor (5.2 review) | Deferred |

The MCP-driven validation also surfaced findings the automated tests missed:

| Gap | Found By | Status |
|-----|----------|--------|
| Missing `<main>` landmark element | Chrome DevTools MCP (Lighthouse) | Identified — simple fix |
| Character counter contrast ratio 2.48:1 | Chrome DevTools MCP (Lighthouse) | Documented as acceptable (WCAG decorative text exemption) |
| `<input>` missing `id`/`name` attribute | Chrome DevTools MCP (Console) | Cosmetic — not an accessibility issue |
| Health endpoint 503 uses non-standard error shape | API Testing MCP | Documented as by-design |

The pattern: BMAD-generated tests covered the happy path and obvious error paths well. Edge cases around **optimistic UI rollback**, **network-level failures**, and **test infrastructure hardening** (coverage gates, shared fixtures, assertion hygiene) were identified only through the adversarial review layer. MCP servers caught **presentational and compliance gaps** (landmarks, contrast, console warnings) that neither the developer agent nor the code review layer targeted.

---

## 4. Debugging with AI

### Cases where AI helped debug issues

The BMAD `bmad-dev-story` skill includes a Debug Log section in each story's Dev Agent Record. The following issues were identified and resolved by the AI during implementation:

**Story 1.1 — Scaffolding**
- TypeScript strict mode required typing the error handler's `error` parameter as `FastifyError` instead of generic `Error`
- Cleaned up Vite boilerplate files (App.css, SVGs) that would have cluttered the project

**Story 1.2 — API CRUD**
- **Plugin scoping bug**: Error handler and CORS were registered as scoped Fastify plugins, so sibling routes received raw Fastify errors instead of formatted ones. AI diagnosed the issue and fixed it by wrapping both plugins with `fastify-plugin` (`fp`) to break encapsulation, making them app-wide.

**Story 5.2 — E2E Tests**
- **Playwright `check()` unreliable with React**: Discovered that Playwright's `check()` method doesn't work correctly on React-managed checkboxes. Switched to `click()` + `toBeChecked()` assertion.
- **Browser architecture mismatch**: `PLAYWRIGHT_BROWSERS_PATH` pointed to x64 binaries on arm64 (Apple Silicon). Fixed by unsetting the env var and reinstalling browsers to the default cache path.
- **Live region text collision**: The live region duplicated todo text (e.g., "Buy groceries" appeared in both the list and the announcement), causing `getByText` to match multiple elements. Fixed by scoping queries to `getByRole('list', { name: /todo list/i })`.

**Story 5.3 — Docker Production Build**
- **`.env` overriding Docker Compose**: `.env` had `NODE_ENV=development` which overrode the Docker Compose default of `production`. Changed `.env` to `production`.
- **Static files plugin registering during tests**: `NODE_ENV=test` caused `@fastify/static` to register and warn about a missing `public/` directory during Vitest runs. Fixed by gating static file registration on `nodeEnv === 'production'` only.

**Code Review — Patch Fixes (across all stories)**

The 3-layer adversarial review caught issues that the developer agent's initial implementation missed:

| Issue | Story | Found By |
|-------|-------|----------|
| `buildApp()` rejection handling missing | 1.1 | Blind Hunter |
| `PORT` validation not enforced | 1.1 | Edge Case Hunter |
| Migration path using `import.meta.url` incorrectly | 1.1 | Acceptance Auditor |
| `.env` not in `.dockerignore` | 1.1 | Edge Case Hunter |
| Graceful shutdown not implemented | 1.1 | Blind Hunter |
| `orderBy(asc(todos.createdAt))` missing on GET | 1.2 | Acceptance Auditor |
| Fetch-error banner dismiss was a no-op (needed state tracking) | 2.2 | Edge Case Hunter |
| Checkbox visual size below 44x44 touch target | 3.1 | Acceptance Auditor |
| Enter on checkbox caused double activation (missing `preventDefault`) | 4.1 | Edge Case Hunter |
| SPA fallback served HTML for unknown `/api/*` routes (needed prefix check + JSON 404) | 5.3 | Edge Case Hunter |
| `staticFiles` plugin not wrapped with `fp` | 5.3 | Blind Hunter |

---

## 5. Limitations Encountered

### What couldn't the AI do well?

**Environment-specific debugging required human context**

- The Playwright browser path issue (arm64 vs x64) was an environment-specific problem that the AI had to work through trial and error. The AI could diagnose the symptoms but needed several iterations to identify the root cause.
- `.env` file overriding Docker Compose defaults was a subtle configuration interaction. The AI eventually found it, but a human developer familiar with Docker Compose's `.env` loading precedence would have caught it faster.

**Optimistic UI edge cases were consistently deferred**

Across stories 1.3, 2.1, 2.2, 4.1, and 4.2, the AI identified but could not fully resolve complex optimistic update edge cases:
- Rollback behavior when the cache is undefined (first render)
- Race conditions between initial fetch and optimistic adds
- Focus management after failed optimistic deletes
- Screen reader announcement timing vs actual mutation confirmation

These were consistently categorized as "deferred" across multiple reviews, suggesting the AI recognized the complexity but couldn't produce confident solutions within the story scope.

**Mock chain limitations**

The AI acknowledged it couldn't meaningfully test Drizzle ORM's chainable query builder arguments through mocks. The mock chain verified method calls (`.select()`, `.from()`, `.where()`) but couldn't assert the specific arguments (e.g., that `orderBy` received `asc(todos.createdAt)`). This is a genuine limitation of the mocking approach, not just an AI shortcoming.

**Security review was static-only**

The AI-driven security review was a static code audit. It explicitly noted it did not run `npm audit`, dynamic scanning, or penetration testing. The findings were accurate for what was in scope (15 findings across Critical/High/Medium/Low/Info), but a production application would need human-driven dynamic testing.

**QA tasks didn't fit the BMAD story lifecycle**

Phase 3 activities (security review, Lighthouse testing, Docker hardening, coverage reporting, MCP-driven validation) were performed ad-hoc outside the BMAD create-story → dev-story → code-review cycle. The methodology provided no structured workflow for these cross-cutting QA concerns — they required human judgment about what to do and when. MCP servers helped fill this gap but were driven by human initiative, not BMAD automation.

**Landmark structure missed by BMAD review layers**

The missing `<main>` landmark element was not caught by any of the 3 adversarial code review layers across 11 stories. It was only surfaced by the Chrome DevTools MCP Lighthouse audit in Phase 3. This suggests BMAD's code review focuses on functional correctness and edge cases rather than HTML landmark semantics.

### Where was human expertise critical?

- **Technology selection** — BMAD's Architect agent proposed options, but the final stack decisions (React 19, Fastify 5, PostgreSQL, Drizzle ORM, Tailwind v4) were made by the developer based on familiarity and ecosystem fit. An AI can compare trade-offs, but it lacks the experience of having built and maintained production systems with those technologies.
- **Architecture rules and approval** — Every architectural decision — PATCH vs PUT, error response shape, deployment topology, naming conventions — required human review and explicit approval, even when AI-suggested. The developer must validate that patterns align with actual project constraints rather than accepting AI-generated architecture at face value.
- **PRD quality as the foundation** — The most consequential human contribution was ensuring the PRD contained clear, complete, and unambiguous requirements before any code was written. BMAD's entire downstream chain (architecture → epics → stories → code) inherits the quality of the PRD. The AI facilitated the 12-step workflow, but the substance — what to build, what to defer, how to define "done" — came from the developer.
- **Deciding which BMAD agents to invoke and in what order** — The methodology provides the agents and skills, but the human decides when to move from PRD to architecture, when stories are ready for development, and when to start a fresh chat session for better context management.
- **Evaluating code review findings** — The adversarial review produced patch/defer/dismiss categorizations, but the human made the final call on which findings to act on immediately, which to defer, and which to dismiss as noise.
- **Manual fixes and overrides** — Some AI-generated output required human correction (e.g., environment-specific configuration, Docker Compose `.env` precedence, Playwright browser path on Apple Silicon).
- **Decision to use MCP servers for Phase 3 validation** — BMAD provided no workflow for post-sprint QA activities. The decision to use API Testing, Playwright, and Chrome DevTools MCP servers for contract validation, user journey testing, and frontend inspection was entirely human-driven.

---

## Summary

| Metric | Value |
|--------|-------|
| BMAD skills invoked | 7 distinct skills, 48 total invocations |
| Stories implemented | 11 |
| Code reviews completed | 11 (33 parallel sub-reviews) |
| Tests generated (BMAD) | 80 (18 backend + 51 frontend + 5 E2E + 1 Lighthouse + 5 patches from review) |
| MCP validation tests | 75 additional (24 API contract + 51 DevTools checks) |
| MCP user journeys | 6 journeys covering 14 FRs, with 9 screenshots |
| Bugs found by adversarial review | 11 patched, 40+ deferred |
| Issues found by MCP servers | 2 actionable (landmark, contrast), 2 informational |
| Security findings | 15 (0 critical, 2 high, 5 medium, 4 low, 4 info) |
| AI model | Claude claude-4.6-opus-high |
| Chat sessions | ~8 |
| MCP servers used | 3 (API Testing, Playwright, Chrome DevTools) |
