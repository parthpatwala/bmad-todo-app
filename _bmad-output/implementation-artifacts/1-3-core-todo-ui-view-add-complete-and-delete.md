# Story 1.3: Core Todo UI — View, Add, Complete, and Delete

Status: done

## Story

As a **user**,
I want to see my todos, add new ones, mark them complete or incomplete, and delete them — all from a single page with instant feedback,
So that I can manage my tasks quickly without page reloads or delays.

## Acceptance Criteria

1. **Given** the user opens the application, **When** the page loads, **Then** all existing todos are fetched from the API and displayed in a single list showing description and completion status, **And** no login or navigation is required to see the list.

2. **Given** the user is on the todo page, **When** they type a description and press Enter (or click an add button), **Then** the todo appears in the list immediately (optimistic update), **And** a `POST /api/todos` call is made to persist it.

3. **Given** a todo is displayed in the list, **When** the user clicks the completion toggle, **Then** the todo visually updates immediately — completed todos appear muted/struck-through, active todos appear normal, **And** a `PATCH /api/todos/:id` call is made to persist the change.

4. **Given** a todo is displayed in the list, **When** the user clicks the delete action, **Then** the todo is removed from the list immediately (optimistic update), **And** a `DELETE /api/todos/:id` call is made.

5. **Given** the user adds, completes, or deletes a todo, **When** they close the browser and reopen the application, **Then** the todo list reflects the persisted state from the server.

6. **Given** the application uses TanStack Query, **When** any mutation succeeds, **Then** the query cache is invalidated on `onSettled` to resync with the server.

## Tasks / Subtasks

- [x] Task 1: Create API client (AC: #1-#5)
  - [x] 1.1 Create `frontend/src/api/todo-api.ts` with typed `fetch` wrappers for all 4 endpoints
- [x] Task 2: Create `useTodos` hook with TanStack Query (AC: #1-#6)
  - [x] 2.1 Create `frontend/src/hooks/use-todos.ts` with `useQuery` for fetching and `useMutation` for create, toggle, and delete
  - [x] 2.2 Implement optimistic updates with `onMutate`/`onError`/`onSettled` for all three mutations
- [x] Task 3: Create UI components (AC: #1-#4)
  - [x] 3.1 Create `frontend/src/components/todo-page.tsx` — orchestrator component using `useTodos` hook
  - [x] 3.2 Create `frontend/src/components/todo-input.tsx` — text input with Enter key and button submission
  - [x] 3.3 Create `frontend/src/components/todo-list.tsx` — renders list of `TodoItem` components
  - [x] 3.4 Create `frontend/src/components/todo-item.tsx` — single todo with completion toggle and delete button, struck-through styling when completed
- [x] Task 4: Wire up App component (AC: #1)
  - [x] 4.1 Update `frontend/src/App.tsx` to render `TodoPage` instead of placeholder
- [x] Task 5: Verify end-to-end functionality (AC: #1-#6)
  - [x] 5.1 Verify todos load on page open from API
  - [x] 5.2 Verify add, toggle, delete work with optimistic updates
  - [x] 5.3 Verify data persists after browser refresh
  - [x] 5.4 Verify `onSettled` invalidates cache for all mutations

### Review Findings

- [x] [Review][Defer] No mutation error feedback in UI — deferred, Story 2.2 handles error/loading/empty states [frontend/src/hooks/use-todos.ts, frontend/src/components/todo-page.tsx]
- [x] [Review][Defer] Generic errors lose HTTP status and server message — deferred, error detail surfacing is Story 2.2 scope [frontend/src/api/todo-api.ts]
- [x] [Review][Defer] Cached todos hidden while query is in error state — deferred, error-with-stale-data pattern is Story 2.2 [frontend/src/components/todo-page.tsx]
- [x] [Review][Defer] Long unbroken description can overflow layout — deferred, responsive layout is Epic 3 (Story 3.1) [frontend/src/components/todo-item.tsx]
- [x] [Review][Defer] Checkbox has no accessible name (aria-label / label) — deferred, accessibility is Epic 4 (Story 4.2) [frontend/src/components/todo-item.tsx]
- [x] [Review][Defer] Enter key during IME composition can submit early — deferred, low priority for personal todo MVP [frontend/src/components/todo-input.tsx]
- [x] [Review][Defer] No guard against duplicate rapid submits — deferred, Story 2.1 adds input validation and feedback [frontend/src/components/todo-input.tsx]
- [x] [Review][Defer] Rapid toggle/delete without per-item pending guard — deferred, low priority for MVP [frontend/src/components/todo-item.tsx]
- [x] [Review][Defer] Optimistic Date.now() ID can collide on rapid adds — deferred, temporary ID replaced by server on refetch; low probability [frontend/src/hooks/use-todos.ts]
- [x] [Review][Defer] Buttons lack explicit type="button" — deferred, no form wrapping exists; cosmetic [frontend/src/components/todo-input.tsx, frontend/src/components/todo-item.tsx]
- [x] [Review][Defer] Malformed JSON response from server can crash — deferred, server always returns valid JSON; defensive parsing is future hardening [frontend/src/api/todo-api.ts]
- [x] [Review][Defer] Race between initial fetch and optimistic add — deferred, edge case on slow networks; cancelQueries mitigates [frontend/src/hooks/use-todos.ts]
- [x] [Review][Defer] onError rollback skipped when previous is undefined — deferred, only occurs on first-ever render before any cache; invalidateQueries in onSettled handles recovery [frontend/src/hooks/use-todos.ts]
- [x] [Review][Defer] Input usable while list is still loading — deferred, by design; input remains usable for fast interaction [frontend/src/components/todo-page.tsx]

## Dev Notes

### Previous Story Intelligence (Stories 1.1 and 1.2)

**Key learnings from Story 1.1:**
- Frontend is scaffolded with Vite + React 19 + TypeScript + Tailwind CSS v4 + TanStack Query v5
- `QueryClientProvider` already wraps `App` in `main.tsx`
- `Todo` type already defined at `frontend/src/types/todo.ts`
- Empty directories exist: `components/`, `hooks/`, `api/` (with `.gitkeep` files)
- Tailwind v4 uses `@import "tailwindcss"` — NO `tailwind.config.js`
- Vite proxy configured: `/api` → `http://localhost:3000`

**Key learnings from Story 1.2:**
- All 4 API endpoints are implemented and working
- `fastify-plugin` was added to fix error handler encapsulation (plugins now use `fp()` wrapper)
- GET returns todos ordered by `createdAt` ascending
- POST trims whitespace and rejects whitespace-only descriptions
- API returns camelCase JSON (`createdAt`, not `created_at`)
- `createdAt` is serialized as ISO 8601 string by Fastify's JSON serializer

**Review findings from Story 1.2:**
- GET endpoint returns deterministic order (orderBy createdAt asc)
- No pagination (deferred — low volume MVP)

### Critical Project Configuration

- Frontend is ESM (`"type": "module"` in `package.json`)
- React 19.x, TanStack Query v5.95.x
- Tailwind CSS v4.2.x via `@tailwindcss/vite` plugin
- Vite 8.x with `/api` proxy to backend port 3000
- TypeScript strict mode enabled

### API Contract (Implemented in Story 1.2)

| Method | Endpoint | Request Body | Success Response |
|--------|----------|-------------|-----------------|
| `GET` | `/api/todos` | — | `200` with `Todo[]` (ordered by `createdAt` asc) |
| `POST` | `/api/todos` | `{ "description": "string" }` | `201` with created `Todo` |
| `PATCH` | `/api/todos/:id` | `{ "completed": boolean }` | `200` with updated `Todo` |
| `DELETE` | `/api/todos/:id` | — | `204 No Content` |

Error responses: `{ "error": "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR", "message": "..." }`

### Existing Todo Type (already created in Story 1.1)

```typescript
// frontend/src/types/todo.ts — DO NOT recreate, import from here
export interface Todo {
  id: number;
  description: string;
  completed: boolean;
  createdAt: string; // ISO 8601 from API
}
```

### New Files to Create

| File | Purpose |
|------|---------|
| `frontend/src/api/todo-api.ts` | Typed `fetch` wrappers for all 4 API endpoints |
| `frontend/src/hooks/use-todos.ts` | TanStack Query hook with useQuery + 3 useMutation (optimistic updates) |
| `frontend/src/components/todo-page.tsx` | Orchestrator component — uses `useTodos` hook, renders children |
| `frontend/src/components/todo-input.tsx` | Text input for adding todos (Enter key + button) |
| `frontend/src/components/todo-list.tsx` | Renders array of `TodoItem` components |
| `frontend/src/components/todo-item.tsx` | Single todo row with toggle checkbox + delete button |

### Existing Files to Modify

| File | Action |
|------|--------|
| `frontend/src/App.tsx` | Replace placeholder with `<TodoPage />` import/render |

### API Client Pattern (`todo-api.ts`)

Use raw `fetch` — do NOT use axios or any HTTP library. Typed wrappers for each endpoint:

```typescript
import type { Todo } from '../types/todo';

const API_BASE = '/api/todos';

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Failed to fetch todos');
  return response.json();
}

export async function createTodo(description: string): Promise<Todo> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  if (!response.ok) throw new Error('Failed to create todo');
  return response.json();
}

export async function toggleTodo(id: number, completed: boolean): Promise<Todo> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) throw new Error('Failed to update todo');
  return response.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete todo');
}
```

`todo-api.ts` is the ONLY file that makes HTTP calls — components never call `fetch` directly.

### TanStack Query v5 Optimistic Update Pattern

The architecture requires the `onMutate`/`onError`/`onSettled` cache-manipulation pattern for optimistic updates. TanStack Query v5 passes a `context` parameter to callbacks. Key pattern:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = ['todos'];

// In the hook:
const queryClient = useQueryClient();

// Add mutation with optimistic update
const addMutation = useMutation({
  mutationFn: (description: string) => createTodo(description),
  onMutate: async (description) => {
    await queryClient.cancelQueries({ queryKey: QUERY_KEY });
    const previous = queryClient.getQueryData<Todo[]>(QUERY_KEY);
    queryClient.setQueryData<Todo[]>(QUERY_KEY, (old = []) => [
      ...old,
      { id: Date.now(), description, completed: false, createdAt: new Date().toISOString() },
    ]);
    return { previous };
  },
  onError: (_err, _desc, context) => {
    if (context?.previous) {
      queryClient.setQueryData(QUERY_KEY, context.previous);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  },
});
```

**The temporary `id: Date.now()` in the optimistic add** is replaced by the real server `id` when `onSettled` triggers a refetch. This is intentional — the refetch replaces the optimistic cache entry.

Apply the same `onMutate`/`onError`/`onSettled` pattern for toggle and delete mutations.

### Component Architecture (from Architecture Doc)

```
App (QueryClientProvider — already set up in main.tsx)
└── TodoPage (uses useTodos hook)
    ├── TodoInput (text input + add button)
    └── TodoList
        └── TodoItem (×N — checkbox, description, delete button)
```

**Scope for THIS story:** Only `TodoPage`, `TodoInput`, `TodoList`, `TodoItem`. The `EmptyState`, `LoadingState`, and `ErrorBanner` components are deferred to Epic 2 (Story 2.2). For now, use simple inline conditional rendering (e.g., "Loading..." text, basic error text) as temporary placeholders — do NOT create those component files yet.

### Component Boundaries

- `TodoPage` is the ONLY component that uses the `useTodos` hook — it passes callbacks down as props
- `TodoInput` receives an `onAdd(description: string)` callback as a prop
- `TodoList` receives `todos: Todo[]`, `onToggle(id, completed)`, and `onDelete(id)` as props
- `TodoItem` receives a single `todo: Todo`, `onToggle`, and `onDelete` as props
- Components are purely presentational except `TodoPage` which orchestrates the hook

### Styling Guidelines (Tailwind CSS v4)

- Use Tailwind utility classes directly — no custom CSS needed
- Completed todos: `line-through` text decoration + reduced opacity or muted text color (e.g., `text-gray-400`)
- Active todos: normal text (e.g., `text-gray-900`)
- Container: `max-w-2xl mx-auto px-4 py-8` (consistent with existing `App.tsx` placeholder)
- Input: standard form input with border, padding, focus ring
- Delete button: small, text or icon-based, subtle until hover
- Toggle: checkbox element for completion status
- Keep it clean and functional — no excessive styling for MVP. Beautiful polish comes in later epics (responsive, accessibility).

### Naming Conventions (MUST FOLLOW)

- Files: `kebab-case` → `todo-page.tsx`, `todo-api.ts`, `use-todos.ts`
- React components: `PascalCase` → `TodoPage`, `TodoInput`, `TodoList`, `TodoItem`
- Functions/variables: `camelCase` → `createTodo`, `handleSubmit`
- Types: `PascalCase` → `Todo` (already exists)
- Hook: `useTodos` (camelCase with `use` prefix)
- Query key: `['todos']` as a constant

### Anti-Patterns to Avoid

- Do NOT use axios, ky, or any HTTP library — use raw `fetch`
- Do NOT create `EmptyState`, `LoadingState`, or `ErrorBanner` component files — those are Story 2.2
- Do NOT add client-side routing — this is a single page app
- Do NOT add input validation beyond basic empty check — Story 2.1 handles validation
- Do NOT import from `../../../` — keep relative paths no deeper than two levels
- Do NOT co-locate test files — tests go in `__tests__/` (Story 5.1)
- Do NOT use `PUT` for updates — API uses `PATCH`
- Do NOT create a global state store (Redux, Zustand) — TanStack Query handles server state
- Do NOT forget the `onSettled` → `invalidateQueries` pattern — this is required by AC #6
- Do NOT add new npm dependencies — everything needed is already installed

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/implementation-artifacts/1-2-api-endpoints-for-todo-crud.md#API Contract]
- [Source: _bmad-output/implementation-artifacts/1-2-api-endpoints-for-todo-crud.md#Review Findings]
- [Source: TanStack Query v5 Optimistic Updates Guide — https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus-high

### Debug Log References

No issues encountered — clean implementation with zero TypeScript errors.

### Completion Notes List

- Created `todo-api.ts` with typed `fetch` wrappers for GET, POST, PATCH, DELETE endpoints matching the Story 1.2 API contract
- Created `use-todos.ts` hook with TanStack Query v5: `useQuery` for fetching + 3 `useMutation` hooks (add, toggle, delete) with full optimistic update pattern (`onMutate`/`onError`/`onSettled`)
- Created 4 React components following the architecture's component tree: `TodoPage` (orchestrator), `TodoInput` (text input with Enter + button), `TodoList` (list container), `TodoItem` (single row with checkbox toggle + delete)
- Completed todos render with `line-through` text decoration and muted gray text; active todos render in normal dark text
- `TodoPage` is the sole hook consumer — all other components are presentational and receive callbacks via props
- Updated `App.tsx` to render `TodoPage` with proper layout container (`max-w-2xl mx-auto`)
- Verified all CRUD operations work end-to-end via Vite proxy: GET returns todos, POST creates, PATCH toggles, DELETE removes
- Verified data persists across requests (AC #5)
- All `onSettled` callbacks call `invalidateQueries` to resync cache (AC #6)
- TypeScript compilation passes with zero errors
- No new npm dependencies added — all features implemented with existing stack

### Change Log

- 2026-03-30: Story implementation complete — all 5 tasks done, all 6 ACs verified

### File List

- `frontend/src/api/todo-api.ts` (new) — typed fetch wrappers for 4 API endpoints
- `frontend/src/hooks/use-todos.ts` (new) — TanStack Query hook with optimistic updates
- `frontend/src/components/todo-page.tsx` (new) — orchestrator component
- `frontend/src/components/todo-input.tsx` (new) — text input for adding todos
- `frontend/src/components/todo-list.tsx` (new) — renders list of TodoItem components
- `frontend/src/components/todo-item.tsx` (new) — single todo with toggle + delete
- `frontend/src/App.tsx` (modified) — replaced placeholder with TodoPage
