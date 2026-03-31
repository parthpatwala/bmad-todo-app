# Deferred Work

## Deferred from: code review of story 1-1-project-scaffolding-and-infrastructure-setup (2026-03-30)

- Docker `DATABASE_URL` breaks on special characters in password — URL interpolation in docker-compose.yml doesn't URL-encode password. Not an issue with default credentials; revisit when real secrets are used.
- Dockerfile runs as root with no HEALTHCHECK — hardening issue. Add non-root USER and Docker HEALTHCHECK before production deployment.
- `pino` not listed as explicit dependency in package.json — Fastify bundles pino transitively. Consider adding explicit dep if Pino APIs are used directly in future stories.

## Deferred from: code review of story 1-2-api-endpoints-for-todo-crud (2026-03-30)

- GET /api/todos is unbounded (no pagination/limit) — single-user MVP with low data volume. Add pagination if data grows.
- Unicode invisible characters (e.g. U+00A0 no-break space) bypass String.trim() — `trim()` handles standard ASCII whitespace. Exotic Unicode whitespace could produce visually-empty descriptions. Not actionable for personal todo MVP.
- 413 Payload Too Large maps to INTERNAL_ERROR — error handler STATUS_CODE_MAP does not include 413. Low priority since description max is 500 chars and Fastify default body limit is 1MiB.

## Deferred from: code review of story 1-3-core-todo-ui-view-add-complete-and-delete (2026-03-30)

- No mutation error feedback in UI — mutations only rollback optimistic cache; no toast/banner for failed add/toggle/delete. Story 2.2 handles error states.
- Generic errors lose HTTP status and server message — `todo-api.ts` throws `new Error('Failed to ...')` without response status or server error body. Future hardening.
- Cached todos hidden while query is in error state — `todo-page.tsx` hides list entirely on `isError`; could show stale data with error banner. Story 2.2 scope.
- Long unbroken description can overflow layout — `todo-item.tsx` span has no `break-words`/`overflow-wrap`. Epic 3 (responsive layout).
- Checkbox has no accessible name (aria-label / label) — checkbox not associated with description text. Epic 4 (accessibility).
- Enter key during IME composition can submit early — `onKeyDown` fires on Enter without `isComposing` guard. Low priority for personal MVP.
- No guard against duplicate rapid submits — no disabled state or pending check on add button/Enter. Story 2.1 input validation.
- Rapid toggle/delete without per-item pending guard — no disabled state during in-flight mutation per item. Low priority MVP.
- Optimistic Date.now() ID can collide on rapid adds — two submits in same millisecond share temp ID; replaced by server on refetch. Low probability.
- Buttons lack explicit type="button" — no form wrapping exists currently; cosmetic/defensive.
- Malformed JSON response from server can crash — `response.json()` not wrapped in try/catch; server always returns valid JSON. Future hardening.
- Race between initial fetch and optimistic add — user can add before initial fetch completes; cancelQueries mitigates. Edge case on slow networks.
- onError rollback skipped when previous is undefined — only on first render before cache exists; onSettled invalidateQueries handles recovery.
- Input usable while list is still loading — by design for fast interaction; optimistic adds work regardless.

## Deferred from: code review of story 2-1-input-validation-and-feedback (2026-03-30)

- Input text cleared before async addTodo completes — on server failure, user loses typed draft and must retype. UX polish for later.
- Local validation error not cleared on input change — error stays visible while editing until next submit. By design (validate on submit only), but could be improved.
- No guard against duplicate/overlapping submits — rapid clicks/Enter can enqueue multiple create calls. Same as Story 1.3 deferred finding.
- Optimistic add rollback skipped when cache undefined — pre-existing; onSettled invalidation recovers.
- Client vs server length rules disagree for non-BMP characters — JS string.length (UTF-16 units) vs JSON Schema maxLength (code points). Edge case with heavy emoji usage.
- Enter-to-submit during IME composition — pre-existing from Story 1.3.
- No maxLength attribute on input element — users can paste very long strings; validated on submit. Cosmetic.
- Non-handler Fastify 400 bodies may use different JSON shape — schema validation errors may lack `message` field; client falls back to generic message.

## Deferred from: code review of story 2-2-loading-empty-and-error-states (2026-03-30)

- Only one mutation error surfaced when both toggle and delete fail — `toggleError || deleteError` masks the second error; low probability in single-user MVP.
- Optimistic rollback skipped when previous is undefined — pre-existing from Story 1.3; onSettled invalidation recovers state.
- No loading indicator during retry after fetch error — `isLoading` stays false on refetch; would need `isFetching`. UX polish.
- Fetch error message from API parsed dynamically but hard-coded in TodoPage — user-friendly default is acceptable for MVP.
- Retry button has no disabled/pending state — rapid clicks can trigger multiple refetches; TanStack Query deduplicates.

## Deferred from: code review of story 3-1-responsive-layout-and-touch-friendly-interactions (2026-03-30)

- ErrorBanner Retry/Dismiss buttons have min-h-[44px] but no min-w-[44px] — text + px-2 padding typically exceeds 44px width, but not guaranteed at all font scales.
- TodoInput error/counter row: long error text has no break-words or min-w-0 — flex row could overflow with very long validation messages on narrow viewports.
- ErrorBanner message has no break-words for long unbroken text — long API error URLs could overflow on narrow viewports.
- AC4 keyboard visibility relies on browser default behavior — no explicit scrollIntoView or viewport handling; works because input is in normal flow at top of page.

## Deferred from: code review of story 4-1-keyboard-navigation-and-focus-management (2026-03-30)

- Optimistic delete rollback doesn't restore focus — if delete API fails and onError restores the item, focus has already moved to next row; low probability in single-user MVP.
- IME composition: Enter submits mid-composition — pre-existing from Story 1.3; no isComposing guard on onKeyDown handlers.
- Rapid back-to-back deletes: multiple rAF callbacks compete for focus — last callback wins; acceptable but not coordinated.
- Error banner: no focus move to banner on error appearance — focus stays on current element; Story 4.2 ARIA/live-region scope.

## Deferred from: code review of story 4-2-screen-reader-support-and-aria-labels (2026-03-30)

- Announcements fire before mutations confirm (optimistic mismatch) — by design: announcements align with optimistic UI; error banner with role="alert" handles failure cases. No corrective "undo" announcement on rollback.
- Rapid successive announce calls drop intermediate messages — multiple actions before the next paint collapse to a single final announcement; a queue would add complexity for minimal benefit in single-user MVP.
- No labeled "todo list" when list is empty — EmptyState provides "No todos yet" context; rendering an empty <ul> with aria-label "Todo list, 0 items" would be misleading since there's no list to interact with.

## Deferred from: code review of story 5-1-unit-and-integration-tests (2026-03-31)

- Coverage thresholds not enforced in vitest config — no `coverage.thresholds` setting in backend or frontend vitest.config.ts; manual verification passes but CI won't gate on coverage floor.
- orderBy arguments never asserted on mock chain — Drizzle mock chain verifies method calls but not the specific arguments (e.g., `asc(todos.createdAt)`); inherent limitation of mocking chainable APIs.
- Mutation error fields and rollback stay untested in useTodos — hook tests verify mutations fire correctly but don't test `addError`, `toggleError`, `deleteError` fields or optimistic update rollback behavior.
- Frontend API tests missing network error tests (fetch throws) — tests mock `fetch` to return error responses but never test `fetch` itself rejecting (network failure); source code has no explicit network error handling.

## Deferred from: code review of story 5-2-end-to-end-tests-with-playwright (2026-03-31)

- `beforeEach` cleanup doesn't assert GET/DELETE response status — API cleanup in E2E tests doesn't verify response ok(), which could silently fail and leak state between tests.
- Duplicated `beforeEach` block across two spec files — identical 8-line cleanup block in `todo-crud.spec.ts` and `todo-validation.spec.ts`; could be extracted to a shared Playwright fixture.
- Story task 1.5 root-level `test:e2e` script not added — the `cd e2e && npx playwright test` command is documented in the dev record but no root package.json script was added.

## Deferred from: code review of story 5-3-production-docker-build-and-deployment (2026-03-31)

- Docker image runs as root — production stage has no `USER` directive; process runs as root. Add non-root user for security hardening before real deployment.
