# Story 1.2: API Endpoints for Todo CRUD

Status: done

## Story

As a **user**,
I want a REST API that supports creating, reading, updating, and deleting todos,
So that my todo data can be reliably stored and retrieved from the server.

## Acceptance Criteria

1. **Given** the API is running, **When** a `POST /api/todos` request is sent with `{ "description": "Buy groceries" }`, **Then** a `201` response is returned with the created todo including `id`, `description`, `completed: false`, and `createdAt` (ISO 8601).

2. **Given** todos exist in the database, **When** a `GET /api/todos` request is sent, **Then** a `200` response is returned with an array of all todos.

3. **Given** a todo with id 1 exists, **When** a `PATCH /api/todos/1` request is sent with `{ "completed": true }`, **Then** a `200` response is returned with the updated todo showing `completed: true`.

4. **Given** a todo with id 1 exists, **When** a `DELETE /api/todos/1` request is sent, **Then** a `204 No Content` response is returned, **And** the todo no longer exists in the database.

5. **Given** a request is sent with an invalid payload (e.g., empty description, missing fields), **When** Fastify JSON Schema validation runs, **Then** a `400` response is returned with `{ "error": "VALIDATION_ERROR", "message": "..." }`.

6. **Given** a `DELETE` or `PATCH` request targets a non-existent todo id, **When** the route handler executes, **Then** a `404` response is returned with `{ "error": "NOT_FOUND", "message": "Todo not found" }`.

7. **Given** any unhandled server error occurs, **When** the global error handler catches it, **Then** a `500` response is returned with `{ "error": "INTERNAL_ERROR", "message": "..." }` and no stack traces or internals are exposed.

## Tasks / Subtasks

- [x] Task 1: Create todo route handlers file (AC: #1-#7)
  - [x] 1.1 Create `backend/src/routes/todo-routes.ts` with all 4 CRUD endpoints
  - [x] 1.2 Implement `GET /api/todos` — select all from `todos` table, return `200` with `Todo[]`
  - [x] 1.3 Implement `POST /api/todos` — insert with `description`, trim whitespace, return `201` with created `Todo`
  - [x] 1.4 Implement `PATCH /api/todos/:id` — update `completed` field, return `200` with updated `Todo` or `404`
  - [x] 1.5 Implement `DELETE /api/todos/:id` — delete by id, return `204` or `404`
- [x] Task 2: Add Fastify JSON Schema validation (AC: #5)
  - [x] 2.1 Define POST body schema: `description` required, `minLength: 1`, `maxLength: 500`, type `string`
  - [x] 2.2 Define PATCH body schema: `completed` required, type `boolean`
  - [x] 2.3 Define params schema for `:id` routes: `id` type `integer`, `minimum: 1`
- [x] Task 3: Register routes and verify (AC: #1-#7)
  - [x] 3.1 Register `todoRoutes` in `backend/src/app.ts`
  - [x] 3.2 Verify all endpoints respond correctly via `curl` or similar against running backend
- [x] Task 4: Ensure API response format compliance (AC: #1, #7)
  - [x] 4.1 Verify all success responses return data directly (no `{ data: ... }` wrapper)
  - [x] 4.2 Verify all error responses use `{ error: "CODE", message: "..." }` format
  - [x] 4.3 Verify `createdAt` is serialized as ISO 8601 string (camelCase, not snake_case)
  - [x] 4.4 Verify `description` is trimmed of leading/trailing whitespace before persistence

### Review Findings

- [x] [Review][Patch] GET /api/todos has no ORDER BY — added `orderBy(asc(todos.createdAt))` for deterministic ordering [backend/src/routes/todo-routes.ts]
- [x] [Review][Defer] GET /api/todos is unbounded (no pagination/limit) — deferred, low data volume MVP
- [x] [Review][Defer] Unicode invisible characters (e.g. U+00A0) bypass String.trim() — deferred, theoretical for personal todo app
- [x] [Review][Defer] 413 Payload Too Large maps to INTERNAL_ERROR instead of a specific code — deferred, pre-existing error handler scope

## Dev Notes

### Previous Story Intelligence (Story 1.1)

**Established patterns from Story 1.1 that MUST be followed:**

- Route files go in `backend/src/routes/` as `kebab-case.ts` files
- Routes are registered in `app.ts` via `await app.register(routePlugin)`
- Route plugins are async functions taking `FastifyInstance` as parameter
- Error handler already exists at `backend/src/plugins/error-handler.ts` — maps 400→`VALIDATION_ERROR`, 404→`NOT_FOUND`, 500→`INTERNAL_ERROR`
- DB connection and Drizzle instance are exported from `backend/src/db/connection.ts` as `db`
- Schema with type exports (`Todo`, `NewTodo`) at `backend/src/db/schema.ts`
- The `pool` is also exported from `connection.ts` (used for graceful shutdown)
- Health route (`health-routes.ts`) provides the template for route file structure
- `import.meta.url` pattern used for path resolution (ESM project)

**Review findings applied to Story 1.1:**
- Error handler now uses a lookup table for status codes (expanded mapping)
- Graceful shutdown handlers registered in `server.ts`
- Migration path resolved via `import.meta.url` (not cwd-relative)

### Critical Project Configuration

- Backend is ESM (`"type": "module"` in `package.json`) — all local imports MUST use `.js` extensions (e.g., `import { db } from '../db/connection.js'`)
- TypeScript strict mode is enabled
- Fastify version: `^5.8`, Drizzle ORM: `^0.40`

### Existing Files to Modify

| File | Action |
|------|--------|
| `backend/src/app.ts` | Add `import { todoRoutes }` and `app.register(todoRoutes)` |

### New Files to Create

| File | Purpose |
|------|---------|
| `backend/src/routes/todo-routes.ts` | All 4 CRUD route handlers with JSON Schema validation |

### API Contract (from Architecture)

| Method | Endpoint | Request Body | Success Response |
|--------|----------|-------------|-----------------|
| `GET` | `/api/todos` | — | `200` with `Todo[]` |
| `POST` | `/api/todos` | `{ "description": "string" }` | `201` with `Todo` |
| `PATCH` | `/api/todos/:id` | `{ "completed": boolean }` | `200` with `Todo` |
| `DELETE` | `/api/todos/:id` | — | `204 No Content` |

### Fastify JSON Schema Validation Pattern

Fastify uses Ajv v8 for built-in request validation. Define schemas inline in route options:

```typescript
app.post('/api/todos', {
  schema: {
    body: {
      type: 'object',
      required: ['description'],
      properties: {
        description: { type: 'string', minLength: 1, maxLength: 500 },
      },
      additionalProperties: false,
    },
  },
}, async (request, reply) => {
  // request.body is validated and typed
});
```

Schema validation failures automatically return `400` via Fastify, which the global error handler formats as `{ "error": "VALIDATION_ERROR", "message": "..." }`.

### Drizzle ORM Query Patterns

Required imports (all from the project — do NOT add new dependencies):

```typescript
import { db } from '../db/connection.js';
import { todos } from '../db/schema.js';
import { eq } from 'drizzle-orm';
```

CRUD operations using Drizzle query builder:

```typescript
// SELECT all
const allTodos = await db.select().from(todos);

// INSERT with returning
const [created] = await db.insert(todos)
  .values({ description: 'Buy groceries' })
  .returning();

// UPDATE with returning
const [updated] = await db.update(todos)
  .set({ completed: true })
  .where(eq(todos.id, 1))
  .returning();

// DELETE with returning (to check if row existed)
const [deleted] = await db.delete(todos)
  .where(eq(todos.id, 1))
  .returning();
```

### 404 Handling Pattern

For PATCH and DELETE, use `.returning()` and check if the result array is empty:

```typescript
const [updated] = await db.update(todos)
  .set({ completed: body.completed })
  .where(eq(todos.id, id))
  .returning();

if (!updated) {
  reply.status(404).send({ error: 'NOT_FOUND', message: 'Todo not found' });
  return;
}
```

Do NOT throw a Fastify error for 404 — send the response directly to avoid the error handler reformatting the message.

### Whitespace Trimming

The `description` field MUST be trimmed before persistence:

```typescript
const description = (request.body as { description: string }).description.trim();
```

This happens AFTER schema validation (which checks `minLength: 1`), so a whitespace-only description passes schema validation but should still be rejected after trimming. Add explicit post-trim validation:

```typescript
if (description.length === 0) {
  reply.status(400).send({
    error: 'VALIDATION_ERROR',
    message: 'Description cannot be empty',
  });
  return;
}
```

### camelCase JSON Serialization

Drizzle ORM with the schema using `timestamp('created_at')` with a camelCase TypeScript field name `createdAt` handles the mapping automatically. The TypeScript objects returned by Drizzle already use `createdAt` (camelCase), which Fastify serializes as-is to JSON.

However, `timestamp` columns return JavaScript `Date` objects from PostgreSQL. For ISO 8601 string serialization, Fastify's default JSON serializer calls `.toJSON()` on Date objects, which returns an ISO 8601 string. No manual conversion needed.

### Params Type for Route Handlers

Fastify route parameters come as strings. Parse `:id` as integer:

```typescript
const id = Number((request.params as { id: string }).id);
```

Alternatively, use JSON Schema to coerce the type:

```typescript
schema: {
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
    required: ['id'],
  },
}
```

With `type: 'integer'` in the schema, Fastify's Ajv coerces the string param to a number automatically.

### Naming Conventions (MUST FOLLOW)

- Route file: `todo-routes.ts` (kebab-case)
- Function export: `todoRoutes` (camelCase)
- DB queries: Use Drizzle query builder, never raw SQL
- Response format: Return `Todo` objects directly (no wrapper), errors as `{ error, message }`
- JSON fields: `camelCase` (`createdAt`, not `created_at`)

### Existing Route File Template

Follow the exact same structure as `backend/src/routes/health-routes.ts`:

```typescript
import type { FastifyInstance } from 'fastify';

export async function todoRoutes(app: FastifyInstance) {
  // All routes defined here
}
```

Then register in `app.ts` alongside existing routes:

```typescript
import { todoRoutes } from './routes/todo-routes.js';
// ...
await app.register(todoRoutes);
```

### Anti-Patterns to Avoid

- Do NOT create a service/repository layer — route handlers call Drizzle directly (architecture decision for single entity)
- Do NOT use `PUT` — use `PATCH` for partial updates
- Do NOT wrap success responses in `{ data: ... }`
- Do NOT return `null` in API responses
- Do NOT expose stack traces in error responses
- Do NOT use `parseInt` for id parsing — use JSON Schema coercion with `type: 'integer'`
- Do NOT forget `additionalProperties: false` in body schemas to reject unexpected fields
- Do NOT create separate files per endpoint — all 4 CRUD operations go in `todo-routes.ts`
- Do NOT add new npm dependencies — everything needed is already installed

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Boundaries — Backend]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffolding-and-infrastructure-setup.md#Review Findings]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus-high

### Debug Log References

- Error handler encapsulation issue: Fastify `setErrorHandler` inside a registered plugin only applies to that plugin's scope. Validation errors from sibling route plugins were returning raw Fastify error format instead of the standardized `{ error, message }`. Fixed by wrapping error-handler.ts and cors.ts with `fastify-plugin` (`fp`) to break encapsulation.
- `additionalProperties: false` with Fastify's default Ajv config (`removeAdditional: true`): Extra properties are silently stripped rather than rejected. This is acceptable — extra fields never reach the handler or database.

### Completion Notes List

- All 7 acceptance criteria verified via live curl testing:
  - AC1: POST /api/todos returns 201 with created Todo (id, description, completed: false, createdAt ISO 8601)
  - AC2: GET /api/todos returns 200 with Todo[] array
  - AC3: PATCH /api/todos/:id returns 200 with updated Todo (completed toggled)
  - AC4: DELETE /api/todos/:id returns 204 No Content, todo removed from DB
  - AC5: Invalid payloads (empty description, missing fields, invalid id) return 400 with `{ error: "VALIDATION_ERROR", message: "..." }`
  - AC6: PATCH/DELETE on non-existent id returns 404 with `{ error: "NOT_FOUND", message: "Todo not found" }`
  - AC7: Global error handler catches all errors, returns standardized format, no internals exposed
- Whitespace trimming verified: `"  trimmed text  "` stored as `"trimmed text"`
- Whitespace-only description rejected post-trim with 400 VALIDATION_ERROR
- Non-integer id params rejected with 400 VALIDATION_ERROR
- Health endpoint regression check passed
- TypeScript compiles cleanly (tsc --noEmit)
- Added `fastify-plugin` as direct dependency to fix error handler encapsulation

### Change Log

- 2026-03-30: Story 1.2 implemented — all 4 CRUD endpoints with JSON Schema validation, error handling, and whitespace trimming. Fixed error handler plugin encapsulation with fastify-plugin.

### File List

- backend/src/routes/todo-routes.ts (new)
- backend/src/app.ts (modified — registered todoRoutes)
- backend/src/plugins/error-handler.ts (modified — wrapped with fastify-plugin for global scope)
- backend/src/plugins/cors.ts (modified — wrapped with fastify-plugin for global scope)
- backend/package.json (modified — added fastify-plugin dependency)
- backend/package-lock.json (modified)
