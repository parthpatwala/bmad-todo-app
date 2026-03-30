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
