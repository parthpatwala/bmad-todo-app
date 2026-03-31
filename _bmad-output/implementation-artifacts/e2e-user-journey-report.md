# E2E User Journey Report — Playwright MCP

**Project:** bmad-todo-app
**Date:** 2026-03-31
**Tool:** @playwright/mcp (Playwright MCP Server, browser automation)
**Frontend:** React 19.x + Vite on http://localhost:5173
**Backend:** Fastify 5.x on http://localhost:3000

## Overview

This report documents interactive E2E user journeys executed via the Playwright MCP server against a running instance of the todo application. Each journey was performed step-by-step through the browser, with screenshots captured at each stage and accessibility snapshots verified programmatically.

## Journey 1: Empty State Verification

**Story Reference:** Story 2.2 (FR16)
**Status:** PASS

| Step | Action | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | Navigate to app | Page loads | App loaded at `localhost:5173` | PASS |
| 2 | Verify empty state message | "No todos yet. Add one above!" | Message displayed as `<p>` element | PASS |
| 3 | Verify no todo list rendered | No `<ul>` present | No list element in accessibility tree | PASS |
| 4 | Verify input available | Text input with placeholder | `textbox "New todo description"` with placeholder "What needs to be done?" | PASS |
| 5 | Verify character counter | "0 / 500" displayed | Present below input | PASS |

**Screenshot:** [01-empty-state.png](screenshots/01-empty-state.png)

## Journey 2: Create Todo

**Story Reference:** Story 1.3 (FR1, FR2, FR9)
**Status:** PASS

| Step | Action | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | Click input field | Input focused | Input received focus | PASS |
| 2 | Type "Buy groceries for the week" | Text appears in input | Text displayed, counter shows "26 / 500" | PASS |
| 3 | Click "Add" button | Todo created | Todo appears in list | PASS |
| 4 | Verify todo in list | Description visible | `list "Todo list, 1 item"` with `listitem` containing description | PASS |
| 5 | Verify input cleared | Input empty after submit | Input cleared, counter reset to "0 / 500" | PASS |
| 6 | Verify focus returns to input | Focus on input | Input has `[active]` state | PASS |
| 7 | Verify ARIA announcement | Live region announces add | `"Todo added: Buy groceries for the week"` | PASS |
| 8 | Verify todo item structure | Checkbox + description + delete button | All three elements present in listitem | PASS |

**Screenshots:**
- [02-create-todo-typing.png](screenshots/02-create-todo-typing.png) — Text entered in input
- [03-todo-created.png](screenshots/03-todo-created.png) — Todo visible in list

## Journey 3: Complete Todo

**Story Reference:** Story 1.3 (FR3, FR7)
**Status:** PASS

| Step | Action | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | Click completion checkbox | Todo marked complete | Checkbox shows `[checked]` state | PASS |
| 2 | Verify visual distinction | Muted/strikethrough text | Text appears with line-through and reduced opacity | PASS |
| 3 | Verify ARIA label change | Label reflects toggle | Changed to `Mark "..." as incomplete` | PASS |
| 4 | Verify ARIA announcement | Live region announces | `"Buy groceries for the week marked as complete"` | PASS |

**Screenshot:** [04-todo-completed.png](screenshots/04-todo-completed.png)

## Journey 4: Delete Todo

**Story Reference:** Story 1.3 (FR5)
**Status:** PASS

| Step | Action | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | Click "Delete" button | Todo removed | Todo item removed from DOM | PASS |
| 2 | Verify list gone | No list when empty | `list` element removed, empty state restored | PASS |
| 3 | Verify empty state returns | "No todos yet" message | Empty state paragraph visible | PASS |
| 4 | Verify focus management | Focus moves to input | Input has `[active]` state (FR28) | PASS |
| 5 | Verify ARIA announcement | Live region announces | `"Todo deleted: Buy groceries for the week"` | PASS |

**Screenshot:** [05-todo-deleted.png](screenshots/05-todo-deleted.png)

## Journey 5: Input Validation

**Story Reference:** Story 2.1 (FR10, FR12)
**Status:** PASS

| Step | Action | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | Click "Add" with empty input | Submission prevented | No todo created | PASS |
| 2 | Verify validation message | Inline error displayed | `alert "Description cannot be empty"` in red below input | PASS |
| 3 | Verify ARIA role | Error announced to screen readers | Element uses `role="alert"` (auto-announced) | PASS |
| 4 | Type valid description | Error persists until submit | Error visible while typing (clears on next successful submit) | PASS |
| 5 | Submit valid todo | Error clears, todo created | Validation error removed, todo appears in list | PASS |

**Screenshots:**
- [06-input-validation-empty.png](screenshots/06-input-validation-empty.png) — Validation error shown
- [07-validation-cleared-after-fix.png](screenshots/07-validation-cleared-after-fix.png) — State after successful submission

### Observation

The validation error message remains visible while the user types corrective input. It clears upon successful form submission. This is a valid UX pattern (error clears on next action success), though an alternative approach would be to clear the error as soon as the user starts typing. Both patterns are acceptable; the current implementation matches the AC in Story 2.1: "When they correct the input and resubmit, then the validation error message is cleared."

## Journey 6: Error Handling (Network Failure)

**Story Reference:** Story 2.2 (FR18, FR19, NFR12)
**Status:** PASS

| Step | Action | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | Mock network failure via `page.route()` abort | API calls fail | All `/api/todos` requests aborted | PASS |
| 2 | Reload page | Loading state → error state | "Loading todos..." shown first, then error banner after TanStack Query retries exhaust | PASS |
| 3 | Verify error message | User-friendly text | `"Unable to load todos. Please try again."` | PASS |
| 4 | Verify no technical details | No stack traces/status codes | Clean user-friendly message only | PASS |
| 5 | Verify ARIA role | Error announced to screen readers | Error banner uses `role="alert"` | PASS |
| 6 | Verify action buttons | Retry and Dismiss options | Both `button "Retry"` and `button "Dismiss"` present | PASS |
| 7 | Remove network mock | API calls restored | Route interception removed | PASS |
| 8 | Click "Retry" button | App recovers | Empty state restored successfully | PASS |

**Screenshots:**
- [08-error-handling-network-failure.png](screenshots/08-error-handling-network-failure.png) — Error banner with Retry/Dismiss
- [09-error-recovery-after-retry.png](screenshots/09-error-recovery-after-retry.png) — Recovered state after retry

### Observation: TanStack Query Retry Behavior

After mocking the network failure, the app showed "Loading todos..." for approximately 8 seconds before displaying the error banner. This is due to TanStack Query's default retry behavior (3 retries with exponential backoff). This is expected behavior — the loading state transitions to error state after all retries are exhausted. The app never shows a blank screen or crashes (NFR12 satisfied).

## Accessibility Findings Summary

All user journeys confirmed strong accessibility compliance:

| Feature | Implementation | FR |
|---|---|---|
| ARIA live region | Announces add/complete/delete actions via `aria-live="polite"` | FR26 |
| Dynamic ARIA labels | Checkbox toggles between "as complete"/"as incomplete" | FR26 |
| Alert roles | Validation errors and error banner use `role="alert"` | FR26 |
| Focus management | Focus returns to input after add; moves to input after last todo deleted | FR28 |
| Todo list label | Dynamic count `"Todo list, N items"` | FR26 |
| Semantic HTML | `<ul>`, `<li>`, `<h1>`, `<button>`, `<input>` used correctly | FR25 |

## FR Coverage Matrix

| FR | Description | Journey | Result |
|---|---|---|---|
| FR1 | Create todo with text description | Journey 2 | PASS |
| FR2 | View all todos on app load | Journey 2 | PASS |
| FR3 | Mark todo as complete | Journey 3 | PASS |
| FR5 | Delete a todo | Journey 4 | PASS |
| FR7 | Visual distinction: completed vs active | Journey 3 | PASS |
| FR8 | Full list visible without navigation/auth | Journey 2 | PASS |
| FR9 | Display description and completion status | Journey 2, 3 | PASS |
| FR10 | Prevent empty description | Journey 5 | PASS |
| FR12 | Inline validation feedback | Journey 5 | PASS |
| FR16 | Empty state display | Journey 1 | PASS |
| FR18 | Error state on server unreachable | Journey 6 | PASS |
| FR19 | User-friendly error messages | Journey 6 | PASS |
| FR26 | ARIA labels for dynamic content | All journeys | PASS |
| FR28 | Focus management after actions | Journey 2, 4 | PASS |

## Issues Found

**None.** All user journeys passed successfully. The application correctly implements all tested functional requirements.

### Minor Observations (Not Issues)

1. **Validation error persistence:** The validation error remains visible while typing corrective input. It clears on next successful submit. This matches the Story 2.1 AC wording.
2. **TanStack Query retry delay:** ~8 second delay between network failure and error banner display due to 3 retries with exponential backoff. Expected behavior, not an issue.
3. **Page title:** Still shows default Vite "frontend" title. Previously noted in the DevTools inspection report.

## Screenshots Index

| File | Description |
|---|---|
| `01-empty-state.png` | App loaded with no todos — empty state message visible |
| `02-create-todo-typing.png` | Text entered in input field, character counter showing 26/500 |
| `03-todo-created.png` | Todo "Buy groceries for the week" visible in list |
| `04-todo-completed.png` | Todo marked complete — checked checkbox, muted/strikethrough text |
| `05-todo-deleted.png` | Todo deleted — empty state restored |
| `06-input-validation-empty.png` | Empty submission blocked — red validation error shown |
| `07-validation-cleared-after-fix.png` | State after successful submission clears validation |
| `08-error-handling-network-failure.png` | Network failure error banner with Retry/Dismiss buttons |
| `09-error-recovery-after-retry.png` | App recovered after clicking Retry |
