# API Contract Validation Report

**Project:** bmad-todo-app
**Date:** 2026-03-31
**Backend:** Fastify 5.8.x on http://localhost:3000
**Database:** PostgreSQL 16.x

## Contract Source

Architecture Decision Document: `_bmad-output/planning-artifacts/architecture.md`
Error handler: `backend/src/plugins/error-handler.ts`

## Endpoint Validation Results

### 1. GET /api/health

| Test Case | Expected | Actual | Status |
|---|---|---|---|
| Health check (DB reachable) | `200` with `{ status: "ok" }` | `200` with `{"status":"ok"}` | PASS |

> **Note:** The 503 failure path returns `{ status: "unhealthy", error: "Database unreachable" }`, which deviates from the standard `{ error, message }` shape used by `error-handler.ts`. This is by design in `health-routes.ts` — the health endpoint handles its own errors without going through the global error handler. Covered by unit tests in `backend/__tests__/routes/health-routes.test.ts`.

### 2. GET /api/todos

| Test Case | Expected | Actual | Status |
|---|---|---|---|
| Empty list | `200` with `[]` | `200` with `[]` | PASS |
| With todos | `200` with `Todo[]` (id, description, completed, createdAt) | `200` with array of `{ id, description, completed, createdAt }` | PASS |
| Field types | `id: integer`, `description: string`, `completed: boolean`, `createdAt: ISO 8601` | All match | PASS |
| No null fields | All fields present and non-null | Confirmed | PASS |

### 3. POST /api/todos

| Test Case | Expected | Actual | Status |
|---|---|---|---|
| Valid description | `201` with created `Todo` | `201` with `{ id, description, completed: false, createdAt }` | PASS |
| Empty description `""` | `400` with `{ error, message }` | `400` `{"error":"VALIDATION_ERROR","message":"body/description must NOT have fewer than 1 characters"}` | PASS |
| Whitespace only `"   "` | `400` with `{ error, message }` | `400` `{"error":"VALIDATION_ERROR","message":"Description cannot be empty"}` | PASS |
| Too long (501 chars) | `400` with `{ error, message }` | `400` `{"error":"VALIDATION_ERROR","message":"body/description must NOT have more than 500 characters"}` | PASS |
| Missing description `{}` | `400` with `{ error, message }` | `400` `{"error":"VALIDATION_ERROR","message":"body must have required property 'description'"}` | PASS |
| Whitespace trimming | Trimmed description persisted | `"  Trimmed task  "` → `"Trimmed task"` | PASS |
| Extra properties stripped | `additionalProperties: false` | Extra fields silently removed, `201` returned | PASS |

### 4. PATCH /api/todos/:id

| Test Case | Expected | Actual | Status |
|---|---|---|---|
| Toggle completed | `200` with updated `Todo` | `200` with full `Todo` (`id`, `description`, `completed: true`, `createdAt`) | PASS |
| Non-existent ID | `404` with `{ error: "NOT_FOUND", message }` | `404` `{"error":"NOT_FOUND","message":"Todo not found"}` | PASS |
| Invalid ID (non-integer) | `400` with `{ error, message }` | `400` `{"error":"VALIDATION_ERROR","message":"params/id must be integer"}` | PASS |
| Missing completed field | `400` with `{ error, message }` | `400` `{"error":"VALIDATION_ERROR","message":"body must have required property 'completed'"}` | PASS |

### 5. DELETE /api/todos/:id

| Test Case | Expected | Actual | Status |
|---|---|---|---|
| Existing todo | `204 No Content` | `204` (empty body) | PASS |
| Non-existent ID | `404` with `{ error: "NOT_FOUND", message }` | `404` `{"error":"NOT_FOUND","message":"Todo not found"}` | PASS |

## Error Response Format Validation

All error responses conform to the standardized shape from `error-handler.ts`:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message"
}
```

| Status Code | Error Code | Observed |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Yes — empty description, too long, missing fields, invalid ID |
| 404 | `NOT_FOUND` | Yes — PATCH and DELETE for non-existent IDs |
| 500 | `INTERNAL_ERROR` | Handled by global error handler (not triggered in live validation; covered by unit tests) |

> **Scope:** The error handler also maps 401, 403, 409, and 429 status codes, but these are unused in the current MVP API (no auth, no conflict detection, no rate limiting). They exist for Phase 2 extensibility.

All error responses have:
- `error`: string (error code from `STATUS_CODE_MAP`)
- `message`: string (human-readable, no stack traces or internal details)

## Multi-Step CRUD Flow

**Scenario:** POST → GET (verify) → PATCH → GET (verify) → DELETE → GET (verify)

| Step | Action | Expected | Result | Status |
|---|---|---|---|---|
| 1 | POST `{ description: "CRUD flow test item" }` | `201` with new Todo | `id: 38`, `completed: false` | PASS |
| 2 | GET `/api/todos` | Created todo in list | Found id 38, all fields valid | PASS |
| 3 | PATCH `/api/todos/38` `{ completed: true }` | `200` with `completed: true` | `completed: true` confirmed | PASS |
| 4 | GET `/api/todos` | Updated state persisted | id 38 has `completed: true` | PASS |
| 5 | DELETE `/api/todos/38` | `204 No Content` | `204` returned | PASS |
| 6 | GET `/api/todos` | Deleted todo absent | id 38 not in list | PASS |

## Reusable API Test Collection

### Base URL

```
http://localhost:3000
```

### Requests

#### Health Check
```
GET /api/health
Expected: 200 { "status": "ok" }
```

#### List Todos
```
GET /api/todos
Expected: 200 Todo[]
```

#### Create Todo
```
POST /api/todos
Content-Type: application/json
Body: { "description": "string (1-500 chars)" }
Expected: 201 Todo
```

#### Create Todo - Validation Errors
```
POST /api/todos
Body: { "description": "" }          → 400 VALIDATION_ERROR
Body: { "description": "   " }       → 400 VALIDATION_ERROR (post-trim)
Body: { "description": "<501 chars>" } → 400 VALIDATION_ERROR
Body: {}                              → 400 VALIDATION_ERROR
```

#### Update Todo (Toggle Completion)
```
PATCH /api/todos/:id
Content-Type: application/json
Body: { "completed": boolean }
Expected: 200 Todo (updated)
Not found: 404 { "error": "NOT_FOUND", "message": "Todo not found" }
```

#### Delete Todo
```
DELETE /api/todos/:id
Expected: 204 (no body)
Not found: 404 { "error": "NOT_FOUND", "message": "Todo not found" }
```

### Todo Schema

```json
{
  "id": 1,
  "description": "Task description",
  "completed": false,
  "createdAt": "2026-03-31T15:55:08.911Z"
}
```

### Error Schema

```json
{
  "error": "VALIDATION_ERROR | NOT_FOUND | INTERNAL_ERROR",
  "message": "Human-readable error description"
}
```

## Summary

| Category | Tests | Passed | Failed |
|---|---|---|---|
| GET /api/health | 1 | 1 | 0 |
| GET /api/todos | 4 | 4 | 0 |
| POST /api/todos | 7 | 7 | 0 |
| PATCH /api/todos/:id | 4 | 4 | 0 |
| DELETE /api/todos/:id | 2 | 2 | 0 |
| CRUD Flow (6-step) | 6 | 6 | 0 |
| **Total** | **24** | **24** | **0** |

**Result: ALL 24 TESTS PASSED — API contracts validated against architecture.md specifications.**

> **Relationship to automated tests:** This report supplements the unit tests in `backend/__tests__/routes/` which use mocked DB calls via `app.inject()`. This validation runs against the live backend with a real PostgreSQL database, confirming end-to-end behavior. The CRUD flow steps overlap with individual endpoint tests above — the flow validates state persistence across sequential operations rather than independent coverage.
