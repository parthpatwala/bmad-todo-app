---
stepsCompleted:
  - step-01-validate-prerequisites.md
  - step-02-design-epics.md
  - step-03-create-stories.md
  - step-04-final-validation.md
inputDocuments:
  - prd.md
  - architecture.md
---

# bmad-todo-app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bmad-todo-app, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can create a new todo by entering a text description
FR2: User can view all existing todos in a single list upon app load
FR3: User can mark a todo as complete
FR4: User can mark a completed todo as incomplete (toggle)
FR5: User can delete a todo
FR6: System stores a creation timestamp for each todo automatically
FR7: User can visually distinguish completed todos from active todos at a glance
FR8: User can see the full list of todos without any navigation or authentication
FR9: System displays todos with their description and completion status
FR10: System prevents creation of a todo with an empty or whitespace-only description
FR11: System enforces a maximum length on todo descriptions
FR12: System provides inline feedback when input validation fails
FR13: System persists all todo data across browser sessions (page refresh, tab close, reopen)
FR14: System persists all todo data across server restarts
FR15: System maintains data consistency between the UI and the server after every operation
FR16: System displays an empty state when no todos exist
FR17: System displays a loading state while fetching todos from the server
FR18: System displays an error state when the server is unreachable or returns an error
FR19: System provides user-friendly error messages (no raw technical errors exposed)
FR20: System rolls back optimistic UI updates when the corresponding API call fails
FR21: User can perform all CRUD operations on mobile devices (320px viewport and up)
FR22: User can perform all CRUD operations on desktop devices (up to 1920px viewport)
FR23: System provides touch-friendly interaction targets on mobile viewports
FR24: System adapts layout across mobile, tablet, and desktop breakpoints without horizontal scrolling
FR25: User can navigate and operate all interactive elements using keyboard only
FR26: System provides appropriate ARIA labels for dynamic content and status changes
FR27: System maintains visible focus indicators on interactive elements
FR28: System manages focus appropriately after add, complete, and delete actions
FR29: System exposes a REST API supporting create, read, update, and delete operations for todos
FR30: API accepts and returns JSON for all operations
FR31: API returns appropriate HTTP status codes and error responses for invalid requests

### NonFunctional Requirements

NFR1: All API endpoints respond within 200ms under normal operating conditions
NFR2: UI reflects user actions (add, complete, delete) within 100ms via optimistic updates
NFR3: First Contentful Paint occurs within 1.5 seconds on a standard broadband connection
NFR4: Time to Interactive is under 2.0 seconds on a standard broadband connection
NFR5: Initial JavaScript bundle size does not exceed 200KB gzipped
NFR6: All user input is sanitized server-side before persistence to prevent injection attacks
NFR7: API validates request payloads and rejects malformed or unexpected data with appropriate error codes
NFR8: No sensitive server internals (stack traces, file paths, dependency versions) are exposed in API error responses
NFR9: Todo data survives browser refresh, tab closure, and browser restart without loss
NFR10: Todo data survives server restart without loss (durable storage, not in-memory)
NFR11: Failed API calls do not leave the UI in an inconsistent state — optimistic updates are rolled back on failure
NFR12: The application degrades gracefully when the backend is unreachable, displaying a clear error state rather than crashing or showing a blank screen
NFR13: Application meets WCAG 2.1 AA compliance with zero critical violations
NFR14: All interactive elements are operable via keyboard navigation
NFR15: Color contrast ratios meet minimum thresholds (4.5:1 normal text, 3:1 large text)
NFR16: Dynamic content changes (todo added, completed, deleted, errors) are announced to assistive technologies
NFR17: Focus is managed predictably after state-changing actions (no focus loss)
NFR18: Application starts and runs successfully via a single docker-compose up command with no manual configuration
NFR19: Application requires no external services beyond what is defined in the Docker Compose configuration
NFR20: Codebase maintains minimum 70% meaningful test coverage (unit + integration)
NFR21: Minimum 5 Playwright end-to-end tests pass against a running instance of the application
NFR22: Tests are deterministic — no flaky tests that pass/fail intermittently

### Additional Requirements

- Starter template: Vite `react-ts` scaffold for frontend + manual Fastify TypeScript setup for backend (Architecture specifies this as Epic 1 Story 1)
- Database: PostgreSQL 16 with Drizzle ORM, drizzle-kit for schema-driven migrations, named Docker volume for durability
- API contract: 4 REST endpoints (GET /api/todos, POST /api/todos, PATCH /api/todos/:id, DELETE /api/todos/:id) + health check (GET /api/health), standardized error response format `{ error, message }`
- Frontend state management: TanStack Query for server state with optimistic update pattern (onMutate/onError/onSettled)
- 2-container Docker topology: Fastify serves built frontend via @fastify/static in production, eliminates production CORS
- Vite dev proxy: Configure /api proxy in vite.config.ts for local development (frontend port 5173 → backend port 3000)
- Type synchronization: Todo type defined independently in frontend (types/todo.ts) and backend (Drizzle schema inference), manually synchronized
- Logging: Pino via Fastify built-in (info in production, debug in development)
- Cross-platform scripts: cross-env for NODE_ENV and env var compatibility across OS
- Migrations on startup: Drizzle migrations run automatically as part of Docker startup sequence
- Environment config: .env.example committed, .env gitignored, twelve-factor approach
- Tailwind CSS v4 via @tailwindcss/vite plugin for styling
- Vitest for unit/integration tests, Playwright for E2E tests, @testing-library/react for component tests
- Test organization: __tests__/ directories mirroring source structure, e2e/ at project root

### UX Design Requirements

No UX Design specification document exists for this project. UX requirements are derived from the PRD functional requirements (FR7, FR16-FR20, FR21-FR28) and will be addressed within their respective epics.

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Create todo with text description |
| FR2 | Epic 1 | View all todos on app load |
| FR3 | Epic 1 | Mark todo as complete |
| FR4 | Epic 1 | Toggle completed todo back to incomplete |
| FR5 | Epic 1 | Delete a todo |
| FR6 | Epic 1 | Auto-store creation timestamp |
| FR7 | Epic 1 | Visual distinction: completed vs active |
| FR8 | Epic 1 | Full list visible without navigation/auth |
| FR9 | Epic 1 | Display description and completion status |
| FR10 | Epic 2 | Prevent empty/whitespace-only creation |
| FR11 | Epic 2 | Enforce max description length |
| FR12 | Epic 2 | Inline validation feedback |
| FR13 | Epic 1 | Persist across browser sessions |
| FR14 | Epic 1 | Persist across server restarts |
| FR15 | Epic 1 | UI-server data consistency |
| FR16 | Epic 2 | Empty state display |
| FR17 | Epic 2 | Loading state display |
| FR18 | Epic 2 | Error state display |
| FR19 | Epic 2 | User-friendly error messages |
| FR20 | Epic 2 | Optimistic update rollback on failure |
| FR21 | Epic 3 | Mobile CRUD operations |
| FR22 | Epic 3 | Desktop CRUD operations |
| FR23 | Epic 3 | Touch-friendly targets |
| FR24 | Epic 3 | Adaptive layout, no horizontal scroll |
| FR25 | Epic 4 | Keyboard navigation |
| FR26 | Epic 4 | ARIA labels for dynamic content |
| FR27 | Epic 4 | Visible focus indicators |
| FR28 | Epic 4 | Focus management after actions |
| FR29 | Epic 1 | REST API for CRUD |
| FR30 | Epic 1 | JSON API communication |
| FR31 | Epic 1 | Proper HTTP status codes and errors |

## Epic List

### Epic 1: Project Foundation & Core Task Management
Users can add, view, complete, uncomplete, and delete todos in a working full-stack application with persistent data storage. This is the foundational epic — end-to-end functionality from browser to database.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR13, FR14, FR15, FR29, FR30, FR31

### Epic 2: Input Validation & Error Resilience
Users receive clear, helpful feedback when things go wrong — whether they submit invalid input, the server is unreachable, or an API call fails. The app handles errors gracefully instead of breaking silently.
**FRs covered:** FR10, FR11, FR12, FR16, FR17, FR18, FR19, FR20

### Epic 3: Responsive Design & Mobile Experience
Users can manage their todos seamlessly on any device — from a 320px phone screen to a 1920px desktop monitor — with touch-friendly targets, adaptive layout, and no horizontal scrolling.
**FRs covered:** FR21, FR22, FR23, FR24

### Epic 4: Accessibility
Users with disabilities can fully operate the application using keyboard navigation, screen readers, and assistive technologies, meeting WCAG 2.1 AA compliance.
**FRs covered:** FR25, FR26, FR27, FR28

### Epic 5: Testing & Production Deployment
The application is thoroughly tested and deployable via a single docker-compose up command with zero manual configuration, ensuring reliability and confidence for production use.
**FRs covered:** Cross-cutting (validates all FRs via tests). Primarily addresses NFR18-NFR22.

## Epic 1: Project Foundation & Core Task Management

Users can add, view, complete, uncomplete, and delete todos in a working full-stack application with persistent data storage. This is the foundational epic — end-to-end functionality from browser to database.

### Story 1.1: Project Scaffolding & Infrastructure Setup

As a **developer**,
I want a fully scaffolded monorepo with frontend (Vite + React + TypeScript), backend (Fastify + TypeScript), PostgreSQL database via Docker Compose, and Drizzle ORM with the Todo schema,
So that I have a working development environment to build features on.

**Acceptance Criteria:**

**Given** a clean checkout of the repository
**When** the developer runs `docker-compose up`
**Then** PostgreSQL starts and is accessible on port 5432
**And** the backend Fastify server starts and responds to `GET /api/health` with `200 { "status": "ok" }`

**Given** the backend is running
**When** Drizzle migrations execute on startup
**Then** the `todos` table exists with columns: `id` (serial PK), `description` (varchar 500, not null), `completed` (boolean, default false), `created_at` (timestamp, default now)

**Given** the frontend project is scaffolded
**When** the developer runs `npm run dev` in the frontend directory
**Then** the Vite dev server starts with HMR on port 5173
**And** the Vite config includes an `/api` proxy to the backend on port 3000

**Given** the project structure
**When** a developer inspects the repository
**Then** `.env.example` is committed with required environment variables
**And** `.env` is gitignored
**And** the directory structure matches the Architecture document specification

### Story 1.2: API Endpoints for Todo CRUD

As a **user**,
I want a REST API that supports creating, reading, updating, and deleting todos,
So that my todo data can be reliably stored and retrieved from the server.

**Acceptance Criteria:**

**Given** the API is running
**When** a `POST /api/todos` request is sent with `{ "description": "Buy groceries" }`
**Then** a `201` response is returned with the created todo including `id`, `description`, `completed: false`, and `createdAt` (ISO 8601)

**Given** todos exist in the database
**When** a `GET /api/todos` request is sent
**Then** a `200` response is returned with an array of all todos

**Given** a todo with id 1 exists
**When** a `PATCH /api/todos/1` request is sent with `{ "completed": true }`
**Then** a `200` response is returned with the updated todo showing `completed: true`

**Given** a todo with id 1 exists
**When** a `DELETE /api/todos/1` request is sent
**Then** a `204 No Content` response is returned
**And** the todo no longer exists in the database

**Given** a request is sent with an invalid payload (e.g., empty description, missing fields)
**When** Fastify JSON Schema validation runs
**Then** a `400` response is returned with `{ "error": "VALIDATION_ERROR", "message": "..." }`

**Given** a `DELETE` or `PATCH` request targets a non-existent todo id
**When** the route handler executes
**Then** a `404` response is returned with `{ "error": "NOT_FOUND", "message": "Todo not found" }`

**Given** any unhandled server error occurs
**When** the global error handler catches it
**Then** a `500` response is returned with `{ "error": "INTERNAL_ERROR", "message": "..." }` and no stack traces or internals are exposed

### Story 1.3: Core Todo UI — View, Add, Complete, and Delete

As a **user**,
I want to see my todos, add new ones, mark them complete or incomplete, and delete them — all from a single page with instant feedback,
So that I can manage my tasks quickly without page reloads or delays.

**Acceptance Criteria:**

**Given** the user opens the application
**When** the page loads
**Then** all existing todos are fetched from the API and displayed in a single list showing description and completion status
**And** no login or navigation is required to see the list

**Given** the user is on the todo page
**When** they type a description and press Enter (or click an add button)
**Then** the todo appears in the list immediately (optimistic update)
**And** a `POST /api/todos` call is made to persist it

**Given** a todo is displayed in the list
**When** the user clicks the completion toggle
**Then** the todo visually updates immediately — completed todos appear muted/struck-through, active todos appear normal
**And** a `PATCH /api/todos/:id` call is made to persist the change

**Given** a todo is displayed in the list
**When** the user clicks the delete action
**Then** the todo is removed from the list immediately (optimistic update)
**And** a `DELETE /api/todos/:id` call is made

**Given** the user adds, completes, or deletes a todo
**When** they close the browser and reopen the application
**Then** the todo list reflects the persisted state from the server

**Given** the application uses TanStack Query
**When** any mutation succeeds
**Then** the query cache is invalidated on `onSettled` to resync with the server

## Epic 2: Input Validation & Error Resilience

Users receive clear, helpful feedback when things go wrong — whether they submit invalid input, the server is unreachable, or an API call fails. The app handles errors gracefully instead of breaking silently.

### Story 2.1: Input Validation & Feedback

As a **user**,
I want to be prevented from creating empty or excessively long todos, with clear inline feedback explaining what's wrong,
So that I only create meaningful tasks and understand how to fix invalid input.

**Acceptance Criteria:**

**Given** the user is on the todo page
**When** they attempt to submit a todo with an empty or whitespace-only description
**Then** the submission is prevented
**And** an inline error message is displayed below the input (e.g., "Description cannot be empty")

**Given** the user is on the todo page
**When** they type a description exceeding 500 characters
**Then** the submission is prevented
**And** an inline error message is displayed (e.g., "Description must be 500 characters or less")

**Given** the user has triggered a validation error
**When** they correct the input and resubmit
**Then** the validation error message is cleared
**And** the todo is created successfully

**Given** a `POST /api/todos` request with an empty or too-long description
**When** the server receives it
**Then** the server independently validates and rejects with a `400` response
**And** the description is trimmed of leading/trailing whitespace before persistence

### Story 2.2: Loading, Empty, and Error States

As a **user**,
I want to see clear visual feedback when the app is loading, when my list is empty, and when something goes wrong,
So that I always understand what's happening and never face a blank or broken screen.

**Acceptance Criteria:**

**Given** the application is starting up
**When** todos are being fetched from the server
**Then** a loading indicator is displayed

**Given** the fetch completes
**When** no todos exist in the database
**Then** an empty state is displayed with a message (e.g., "No todos yet. Add one above!")

**Given** the backend is unreachable or returns a server error
**When** the todo list fetch fails
**Then** an error state is displayed with a user-friendly message (e.g., "Unable to load todos. Please try again.")
**And** no raw technical errors, stack traces, or status codes are shown to the user

**Given** the user has added a todo (optimistic update)
**When** the `POST /api/todos` call fails
**Then** the optimistically added todo is removed from the list
**And** an error message is shown to the user

**Given** the user has toggled a todo's completion status (optimistic update)
**When** the `PATCH /api/todos/:id` call fails
**Then** the completion status reverts to its previous state
**And** an error message is shown to the user

**Given** the user has deleted a todo (optimistic update)
**When** the `DELETE /api/todos/:id` call fails
**Then** the deleted todo reappears in the list
**And** an error message is shown to the user

## Epic 3: Responsive Design & Mobile Experience

Users can manage their todos seamlessly on any device — from a 320px phone screen to a 1920px desktop monitor — with touch-friendly targets, adaptive layout, and no horizontal scrolling.

### Story 3.1: Responsive Layout & Touch-Friendly Interactions

As a **user**,
I want the todo app to look and work great on my phone, tablet, and desktop,
So that I can manage my tasks from any device without layout issues or tiny tap targets.

**Acceptance Criteria:**

**Given** the user opens the app on a mobile device (320px–767px viewport)
**When** the page loads
**Then** the layout adapts to a single-column view
**And** the input field, todo items, and action buttons are fully visible without horizontal scrolling
**And** all interactive elements (toggle, delete, add button) have minimum 44x44px touch targets

**Given** the user opens the app on a tablet (768px–1023px viewport)
**When** the page loads
**Then** the layout adapts appropriately with comfortable spacing
**And** no horizontal scrolling occurs

**Given** the user opens the app on a desktop (1024px+ viewport)
**When** the page loads
**Then** the layout uses the available width appropriately (centered content, max-width container)
**And** the experience is comfortable up to 1920px viewport

**Given** the user is on a mobile device
**When** the on-screen keyboard opens to type a todo description
**Then** the input field remains visible and is not obscured by the keyboard

**Given** the user is on a mobile device
**When** they perform all CRUD operations (add, complete, uncomplete, delete)
**Then** all operations work identically to desktop — no functionality is missing or broken on mobile

## Epic 4: Accessibility

Users with disabilities can fully operate the application using keyboard navigation, screen readers, and assistive technologies, meeting WCAG 2.1 AA compliance.

### Story 4.1: Keyboard Navigation & Focus Management

As a **user who relies on keyboard navigation**,
I want to navigate, add, complete, and delete todos using only the keyboard with clear focus indicators,
So that I can fully operate the app without a mouse or touch input.

**Acceptance Criteria:**

**Given** the user is navigating with the keyboard
**When** they Tab through the page
**Then** all interactive elements (input field, add button, completion toggles, delete buttons) receive focus in a logical order
**And** each focused element has a clearly visible focus indicator

**Given** the user has focus on the input field
**When** they type a description and press Enter
**Then** the todo is added
**And** focus remains on (or returns to) the input field for rapid entry

**Given** the user has focus on a todo's completion toggle
**When** they press Enter or Space
**Then** the todo's completion status toggles

**Given** the user has focus on a todo's delete button
**When** they press Enter or Space
**Then** the todo is deleted
**And** focus moves to the next logical element (next todo item, or the input field if the list is now empty)

### Story 4.2: Screen Reader Support & ARIA Labels

As a **user who relies on a screen reader**,
I want dynamic content changes to be announced and all elements to be properly labeled,
So that I have full awareness of the app state without visual cues.

**Acceptance Criteria:**

**Given** the user is using a screen reader
**When** they navigate to the todo list
**Then** the list is announced with an appropriate label (e.g., "Todo list, 3 items")

**Given** the user adds a new todo
**When** the todo appears in the list
**Then** an ARIA live region announces the addition (e.g., "Todo added: Buy groceries")

**Given** the user toggles a todo's completion status
**When** the status changes
**Then** the change is announced to assistive technologies (e.g., "Buy groceries marked as complete")

**Given** the user deletes a todo
**When** the todo is removed
**Then** the removal is announced (e.g., "Todo deleted: Buy groceries")

**Given** an error occurs (validation error, API error)
**When** the error message is displayed
**Then** it is announced to assistive technologies via an ARIA live region

**Given** the application uses color to distinguish completed from active todos
**When** the user inspects the color contrast
**Then** all text meets WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text)

## Epic 5: Testing & Production Deployment

The application is thoroughly tested and deployable via a single docker-compose up command with zero manual configuration, ensuring reliability and confidence for production use.

### Story 5.1: Unit & Integration Tests

As a **developer**,
I want comprehensive unit and integration tests covering backend API routes and frontend components/hooks,
So that I have confidence the application works correctly and regressions are caught early.

**Acceptance Criteria:**

**Given** the backend test suite
**When** tests run via Vitest
**Then** all 4 CRUD route handlers are tested with success and error scenarios
**And** the health check endpoint is tested
**And** input validation edge cases are covered (empty description, too-long description, whitespace trimming)
**And** 404 responses for non-existent todo ids are tested

**Given** the frontend test suite
**When** tests run via Vitest with @testing-library/react
**Then** the TodoInput component is tested for submission and validation feedback
**And** the TodoItem component is tested for completion toggle and delete actions
**And** the TodoList component is tested for rendering a list of todos
**And** the EmptyState and ErrorBanner components are tested for correct rendering
**And** the useTodos hook is tested for query and mutation behavior

**Given** all tests pass
**When** test coverage is measured
**Then** meaningful code coverage is at minimum 70% (unit + integration combined)
**And** all tests are deterministic with no flaky results

### Story 5.2: End-to-End Tests with Playwright

As a **developer**,
I want end-to-end tests that exercise the full user flow through a real browser against a running instance,
So that I can verify the entire stack works together from the user's perspective.

**Acceptance Criteria:**

**Given** a running instance of the application (frontend + backend + database)
**When** the Playwright test suite runs
**Then** at minimum 5 tests pass covering these core flows:

**Given** the app is loaded with no todos
**When** the user creates a todo
**Then** it appears in the list (tests: todo creation)

**Given** a todo exists
**When** the user marks it complete and then incomplete
**Then** the visual state toggles correctly (tests: completion toggle)

**Given** a todo exists
**When** the user deletes it
**Then** it is removed from the list (tests: deletion)

**Given** the user submits an empty description
**When** the validation runs
**Then** an inline error is displayed and no todo is created (tests: input validation)

**Given** todos have been created
**When** the user refreshes the page
**Then** all todos persist and are displayed (tests: data persistence)

### Story 5.3: Production Docker Build & Deployment

As a **developer**,
I want the entire application to build and run from a single `docker-compose up` command,
So that deployment is reproducible with zero manual configuration.

**Acceptance Criteria:**

**Given** a clean checkout of the repository
**When** the developer runs `docker-compose up`
**Then** the PostgreSQL container starts with a named volume for data persistence
**And** the app container builds the frontend (Vite production build)
**And** the app container starts Fastify serving the built static files on `/` and the API on `/api/*`
**And** Drizzle migrations run automatically before the server accepts requests

**Given** the production application is running
**When** the user navigates to the application URL
**Then** the frontend loads and all CRUD operations work end-to-end

**Given** the Docker containers are stopped and restarted
**When** `docker-compose up` runs again
**Then** all previously created todos are still present (PostgreSQL named volume persists data)

**Given** the production configuration
**When** the app container is inspected
**Then** no CORS configuration is needed (same-origin serving)
**And** Pino logging is set to `info` level
**And** no `.env` file is required — `.env.example` documents all environment variables
