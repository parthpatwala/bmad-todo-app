# Story 4.1: Keyboard Navigation & Focus Management

Status: done

## Story

As a **user who relies on keyboard navigation**,
I want to navigate, add, complete, and delete todos using only the keyboard with clear focus indicators,
So that I can fully operate the app without a mouse or touch input.

## Acceptance Criteria

1. **Given** the user is navigating with the keyboard, **When** they Tab through the page, **Then** all interactive elements (input field, add button, completion toggles, delete buttons) receive focus in a logical order, **And** each focused element has a clearly visible focus indicator.

2. **Given** the user has focus on the input field, **When** they type a description and press Enter, **Then** the todo is added, **And** focus remains on (or returns to) the input field for rapid entry.

3. **Given** the user has focus on a todo's completion toggle, **When** they press Enter or Space, **Then** the todo's completion status toggles.

4. **Given** the user has focus on a todo's delete button, **When** they press Enter or Space, **Then** the todo is deleted, **And** focus moves to the next logical element (next todo item, or the input field if the list is now empty).

## Tasks / Subtasks

- [x] Task 1: Ensure logical tab order across all interactive elements (AC: #1)
  - [x] 1.1 Audit current tab order: input → Add button → (for each todo: checkbox → delete) → error banner buttons. Verify DOM order matches visual order — no changes expected since layout is already single-column top-to-bottom
  - [x] 1.2 Add visible focus indicators to all interactive elements that lack them: ensure `focus:ring-2 focus:ring-blue-500` or equivalent `focus-visible:` styles exist on the Add button, Delete buttons, and ErrorBanner buttons
- [x] Task 2: Ensure focus returns to input after adding a todo (AC: #2)
  - [x] 2.1 Add a `useRef` to the input field in `TodoInput`
  - [x] 2.2 After successful `handleSubmit` (after `onAdd` + `setDescription('')`), call `inputRef.current?.focus()` to return focus to the input
- [x] Task 3: Ensure checkbox toggle works with Enter and Space (AC: #3)
  - [x] 3.1 Verify native `<input type="checkbox">` already handles Space (it does natively); verify Enter behavior — native checkboxes do NOT respond to Enter, so add an `onKeyDown` handler on the checkbox that calls `onToggle` when Enter is pressed
- [x] Task 4: Focus management after delete (AC: #4)
  - [x] 4.1 Pass a callback ref or use a ref-based approach in `TodoList`/`TodoPage` to manage focus after deletion
  - [x] 4.2 After a todo is deleted: if more todos remain, focus the next todo's checkbox (or the previous if last was deleted); if the list is now empty, focus the input field
  - [x] 4.3 This requires `TodoList` to hold refs to each todo item's focusable element, and `TodoPage` to pass the input ref down (or use a callback)
- [x] Task 5: Verify and test keyboard-only operation (AC: #1-#4)
  - [x] 5.1 TypeScript compilation passes with zero errors
  - [x] 5.2 Verify full keyboard flow: Tab through all elements, Add via Enter, Toggle via Space/Enter, Delete with focus move

### Review Findings

- [x] [Review][Patch] Enter on checkbox without preventDefault may cause double activation — fixed: added e.preventDefault() before onToggle in Enter handler [frontend/src/components/todo-item.tsx]
- [x] [Review][Defer] Optimistic delete rollback doesn't restore focus — if delete API fails and onError restores the item, focus has already moved to next row; user may be focused on wrong item [frontend/src/components/todo-page.tsx] — deferred, low probability
- [x] [Review][Defer] IME composition: Enter submits mid-composition — pre-existing from Story 1.3; no isComposing guard [frontend/src/components/todo-input.tsx] — deferred
- [x] [Review][Defer] Rapid back-to-back deletes: multiple rAF callbacks compete for focus — last callback wins; behavior is acceptable but not coordinated [frontend/src/components/todo-page.tsx] — deferred, edge case
- [x] [Review][Defer] Error banner: no focus move to banner on error appearance — focus stays on current element when error appears; Story 4.2 ARIA scope [frontend/src/components/error-banner.tsx] — deferred, Story 4.2

## Dev Notes

### Previous Story Intelligence (Stories 1.1–3.1)

**Current state of keyboard/focus behavior:**
- `TodoInput`: `onKeyDown` handles Enter to submit. No `useRef` on the input — focus is NOT returned after submit (browser default may leave focus on button if clicked, or input if Enter was used)
- `TodoItem`: Native `<input type="checkbox">` handles Space toggle natively. Enter does NOT toggle (native behavior). Delete button handles Enter/Space natively as a `<button>`. No focus management after delete — focus is lost when the deleted DOM node is removed
- `TodoList`: No ref tracking of child items. No focus management logic
- `TodoPage`: No ref to the input element. No coordination between deletion and focus
- All buttons/inputs already have `focus:ring-2 focus:ring-blue-500` for focus indicators EXCEPT: the Add button in `TodoInput` and the Delete button in `TodoItem` and the ErrorBanner buttons — these need `focus:ring-2 focus:ring-blue-500` or `focus-visible:ring-2` added

**From deferred work (Story 1.3):**
- "Checkbox has no accessible name (aria-label / label) — checkbox not associated with description text." — The checkbox is now wrapped in a `<label>` (Story 3.1 review fix), but the label has no text and the checkbox has no `aria-label`. **Fix opportunistically**: the `<label>` should connect to the description or have an `aria-label`. However, ARIA labels are Story 4.2 scope. For this story, the `<label>` wrapper already provides clickability — just note this for 4.2.

### Critical Project Configuration

- React 19.x, TypeScript strict mode, ESM frontend
- Files: `kebab-case`; Components: `PascalCase`; Functions: `camelCase`
- No new npm dependencies allowed
- No new files — modify existing components only

### Implementation Approach

**Task 1 (Tab order):** The current DOM order already matches visual order (input → button → todo items → error buttons). Just need to verify and add missing focus ring styles.

**Task 2 (Focus after add):** Add `useRef<HTMLInputElement>(null)` in `TodoInput`, attach to `<input>`, call `.focus()` at end of `handleSubmit`. This is self-contained within `TodoInput`.

**Task 3 (Enter on checkbox):** Add `onKeyDown` to the checkbox `<input>`:
```typescript
onKeyDown={(e) => {
  if (e.key === 'Enter') {
    onToggle(todo.id, !todo.completed);
  }
}}
```
This complements the native Space behavior.

**Task 4 (Focus after delete) — Most Complex:**

The challenge: when a todo is deleted, its DOM node is removed, and focus is lost. We need to move focus to the next logical element.

**Approach:** Use a callback pattern:
1. `TodoPage` creates a ref to the input element and passes it to `TodoInput`
2. `TodoList` tracks refs to each todo item's first focusable element (the checkbox label)
3. When delete is called, `TodoPage` (or a wrapper) determines where focus should go:
   - If todos remain after deletion: focus the next item's checkbox (or previous if deleted the last)
   - If no todos remain: focus the input field

**Simplified approach (recommended for MVP):**
- `TodoPage` holds a ref to the input field (passed to `TodoInput` via `forwardRef` or a prop)
- `TodoList` receives `onDelete` wrapped with focus logic
- After `deleteTodo` is called, use `requestAnimationFrame` or a microtask to focus the appropriate element after React re-renders
- Track the deleted index to determine focus target

**Implementation pattern:**
```typescript
// In TodoPage:
const inputRef = useRef<HTMLInputElement>(null);
const todoRefs = useRef<Map<number, HTMLElement>>(new Map());

const handleDelete = (id: number) => {
  const todoIds = todos.map(t => t.id);
  const deletedIndex = todoIds.indexOf(id);
  deleteTodo(id);
  
  requestAnimationFrame(() => {
    const remainingIds = todoIds.filter(tid => tid !== id);
    if (remainingIds.length === 0) {
      inputRef.current?.focus();
    } else {
      const nextId = remainingIds[Math.min(deletedIndex, remainingIds.length - 1)];
      todoRefs.current.get(nextId)?.focus();
    }
  });
};
```

### Focus Indicator Styles

Current state of `focus:ring` across components:
- Input field (`TodoInput`): `focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500` — HAS focus ring
- Checkbox (`TodoItem`): `focus:ring-2 focus:ring-blue-500` — HAS focus ring
- Add button (`TodoInput`): NO focus ring styles — **needs adding**
- Delete button (`TodoItem`): NO focus ring styles — **needs adding**
- Retry button (`ErrorBanner`): NO focus ring styles — **needs adding**
- Dismiss button (`ErrorBanner`): NO focus ring styles — **needs adding**

Pattern to use: `focus:outline-none focus:ring-2 focus:ring-blue-500` (consistent with existing input/checkbox styles).

### Files to Modify

| File | Changes |
|------|---------|
| `frontend/src/components/todo-input.tsx` | Add `useRef` for input focus return after submit; add focus ring to Add button |
| `frontend/src/components/todo-item.tsx` | Add `onKeyDown` for Enter on checkbox; add focus ring to Delete button; accept a ref for focus management |
| `frontend/src/components/todo-list.tsx` | Pass refs to TodoItems for focus tracking |
| `frontend/src/components/todo-page.tsx` | Hold input ref, manage focus after delete |
| `frontend/src/components/error-banner.tsx` | Add focus ring styles to Retry/Dismiss buttons |

### Files NOT to Modify

- `App.tsx` — no changes needed
- `loading-state.tsx` — no interactive elements
- `empty-state.tsx` — no interactive elements
- `todo-api.ts` — no API changes
- `use-todos.ts` — no hook changes
- NO backend files
- NO new files to create
- NO new npm dependencies

### Scope Boundaries — What NOT to Do

- Do NOT add ARIA labels, `role` attributes, or `aria-live` regions — that is Story 4.2
- Do NOT add screen reader announcements — that is Story 4.2
- Do NOT modify color contrast — assumed compliant; Story 4.2 covers ARIA
- Do NOT add skip navigation links — out of MVP scope
- Do NOT add focus trapping (no modals exist)
- Do NOT modify backend files
- Do NOT add new npm dependencies

### Naming Conventions (MUST FOLLOW)

- Files: `kebab-case` → no new files
- Components: `PascalCase` → no new components
- Functions: `camelCase` → `handleDelete`, `handleKeyDown`
- Refs: `camelCase` → `inputRef`, `todoRefs`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4, Story 4.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Accessibility FR25-FR28]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture — Component Tree]
- [Source: _bmad-output/implementation-artifacts/deferred-work.md — "Checkbox has no accessible name"]
- [Source: WCAG 2.1 — Keyboard (2.1.1), Focus Order (2.4.3), Focus Visible (2.4.7)]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus-high

### Debug Log References

No issues encountered — clean implementation with zero TypeScript errors and successful Vite build.

### Completion Notes List

- Added `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` to Add button in `TodoInput` and Delete button in `TodoItem`. Added `focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2` to Retry and Dismiss buttons in `ErrorBanner`. Tab order verified: DOM order matches visual order (input → Add → checkbox → delete → error buttons).
- Added `useRef` to `TodoInput` with `inputRef` prop support from parent. After successful submit, `ref.current?.focus()` returns focus to the input for rapid entry.
- Added `onKeyDown` handler on checkbox to call `onToggle` when Enter is pressed, complementing native Space behavior.
- Implemented focus management after delete in `TodoPage`: `handleDelete` wraps `deleteTodo` with `requestAnimationFrame` focus logic. Uses `todoRefs` (Map<number, HTMLInputElement>) tracked via callback refs in `TodoList`/`TodoItem`. After deletion: focuses next todo's checkbox (or previous if last deleted), or input field if list is empty.
- `TodoItem` accepts `focusRef` callback prop for ref tracking. `TodoList` accepts `todoRefs` RefObject<Map> and wires callback refs to each `TodoItem`.
- TypeScript compiles with zero errors. Vite build succeeds (72 modules, 85ms).

### Change Log

- 2026-03-30: Story implementation complete — all 5 tasks done, all 4 ACs satisfied

### File List

- `frontend/src/components/todo-input.tsx` (modified) — useRef, focus return after submit, focus ring on Add button, inputRef prop
- `frontend/src/components/todo-item.tsx` (modified) — Enter key on checkbox, focus ring on Delete button, focusRef prop
- `frontend/src/components/todo-list.tsx` (modified) — todoRefs prop, callback ref wiring to TodoItems
- `frontend/src/components/todo-page.tsx` (modified) — inputRef, todoRefs, handleDelete with focus management
- `frontend/src/components/error-banner.tsx` (modified) — focus ring styles on Retry/Dismiss buttons
