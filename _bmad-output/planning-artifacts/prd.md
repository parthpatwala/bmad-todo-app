---
stepsCompleted:
  - step-01-init.md
  - step-02-discovery.md
  - step-02b-vision.md
  - step-02c-executive-summary.md
  - step-03-success.md
  - step-04-journeys.md
  - step-05-domain.md
  - step-06-innovation.md
  - step-07-project-type.md
  - step-08-scoping.md
  - step-09-functional.md
  - step-10-nonfunctional.md
  - step-11-polish.md
  - step-12-complete.md
inputDocuments: []
documentCounts:
  brief: 0
  research: 0
  brainstorming: 0
  projectDocs: 0
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
workflowType: 'prd'
---

# Product Requirements Document - bmad-todo-app

**Author:** parth
**Date:** March 28, 2026

## Executive Summary

bmad-todo-app is a full-stack web application that enables individual users to manage personal tasks through a minimal, intuitive interface. The product targets a single use case — create, view, complete, and delete todo items — and executes it with zero onboarding friction, instant feedback, and polished state handling across desktop and mobile devices. The backend exposes a small CRUD API that persists todo data durably across sessions, architected so authentication and multi-user support can be added later without rework.

### What Makes This Special

Deliberate simplicity is the product. Where most todo applications accumulate features (priorities, deadlines, tags, collaboration) until the core experience degrades, bmad-todo-app strips to the essential interaction loop: add a task, see your tasks, mark them done, remove them. Every UI state — empty list, loading, error, active vs. completed — is explicitly designed, not afterthought. The technical foundation prioritizes maintainability and extensibility without requiring either, delivering a complete product that feels finished at v1.

## Project Classification

- **Type:** Web application (SPA with backend API)
- **Domain:** General productivity — personal task management
- **Complexity:** Low — single-user, no auth, no integrations, no regulated data
- **Context:** Greenfield — new product, no existing codebase

## Success Criteria

### User Success

- A first-time user can add, complete, and delete a todo within 60 seconds of opening the app — no instructions, no tooltips, no onboarding.
- Completed tasks are visually distinguishable from active tasks at a glance without reading individual items.
- The todo list is immediately visible on app load — no navigation, no login gate.
- Users retain full confidence that their data persists: closing the browser and reopening shows the same list.

### Business Success

- V1 delivers a complete, shippable product covering all four CRUD operations with no known broken flows.
- The codebase is clean enough that a new developer can understand the full stack and make a change within one working session.
- Architecture supports adding authentication and multi-user without rewriting existing code.
- All project phases completed with documented learnings.

### Technical Success

- API response times under 200ms for all CRUD operations under normal load.
- UI updates optimistically — the user perceives actions as instant.
- Zero data loss across browser refreshes, tab closures, and server restarts.
- Graceful error handling on both client and server: failures surface user-friendly messages, never raw stack traces or silent swallows.
- Minimum 70% meaningful code coverage (not vanity lines — tested behavior).
- Minimum 5 passing Playwright end-to-end tests covering core user flows.
- Application runs successfully via `docker-compose up` with no manual setup steps.
- Zero critical WCAG accessibility violations.

### Measurable Outcomes

| Criterion | Target |
|---|---|
| Working Application | Todo app fully functional with all CRUD operations |
| Test Coverage | Minimum 70% meaningful code coverage |
| E2E Tests | Minimum 5 passing Playwright tests |
| Docker Deployment | Application runs successfully via `docker-compose up` |
| Accessibility | Zero critical WCAG 2.1 AA violations |
| Documentation | README with setup instructions and AI integration log |
| Framework Comparison | Documented rationale for frontend framework (e.g., Vite vs Next.js) and backend framework (e.g., Express vs Fastify) choices |
| Phase Deliverables | All phases completed with documented learnings |

## User Journeys

### Journey 1: Alex — First-Time User, Happy Path

**Who:** Alex, a developer who just wants a no-nonsense place to track daily tasks. Tired of apps that require sign-up, tutorials, or configuration before being useful.

**Opening Scene:** Alex opens the app URL for the first time. The screen loads instantly — an empty state with a clear input field and a message indicating there are no todos yet. No login wall, no walkthrough modal.

**Rising Action:** Alex types "Review pull request for auth module" and hits Enter. The todo appears immediately in the list. Over the next minute, Alex adds three more tasks. Each appears instantly. The list feels alive and responsive.

**Climax:** Alex finishes the pull request review and clicks the complete toggle. The task visually shifts — muted, struck through — clearly done but still visible. Alex feels a small hit of satisfaction. The distinction between active and completed is obvious at a glance.

**Resolution:** Alex closes the browser tab and reopens it an hour later. All four todos are exactly where they were left — two active, two completed. Alex deletes the completed ones. The app just works. No surprises, no lost data, no friction. Alex bookmarks it.

**Capabilities revealed:** Todo creation, instant UI feedback, completion toggle, visual status distinction, data persistence, deletion, empty state handling.

### Journey 2: Alex — Error Recovery and Edge Cases

**Who:** Same Alex, but things go wrong.

**Opening Scene:** Alex opens the app during a flaky network moment. The app shows a loading state briefly, then displays a clear error message — not a blank screen, not a cryptic stack trace. Alex understands the app is having trouble reaching the server.

**Rising Action:** Network recovers. Alex refreshes, the list loads. Alex tries to add a todo with an empty description — the app prevents it with inline validation. Alex tries adding a very long task description — the app handles it gracefully, truncating or wrapping without breaking layout.

**Climax:** Alex completes a task, but the API call fails mid-request. The UI either rolls back the optimistic update with a clear error toast, or retries transparently. Alex never sees a half-state where the UI says "done" but the server disagrees.

**Resolution:** Alex learns to trust the app — when something goes wrong, it tells you. When it works, it's instant. The error states are as polished as the happy path.

**Capabilities revealed:** Loading state, error state display, input validation, optimistic update rollback, network failure handling, graceful degradation.

### Journey 3: Sam — Mobile User on the Go

**Who:** Sam, a non-technical user managing personal errands from a phone. Doesn't care about the tech stack — just needs it to work on a small screen with touch.

**Opening Scene:** Sam opens the app on a phone browser while waiting in line at a grocery store. The layout adapts — input field is thumb-reachable, todo items are tap-sized, nothing is cut off or horizontally scrolling.

**Rising Action:** Sam adds "Pick up dry cleaning" and "Call dentist" by tapping and typing. The on-screen keyboard doesn't obscure the input. Each todo appears in the list without a page reload.

**Climax:** Sam completes "Pick up dry cleaning" with a single tap. The visual change is obvious even on a small screen — no ambiguity about which tasks are done.

**Resolution:** Later at home on a laptop, Sam opens the same URL. The list is identical, now displayed in a wider layout. The experience is seamless across devices — same data, adapted presentation.

**Capabilities revealed:** Responsive layout, touch-friendly targets, mobile input handling, cross-device data consistency, adaptive UI.

### Journey Requirements Summary

| Capability Area | Revealed By |
|---|---|
| Todo CRUD (create, read, complete, delete) | Journey 1 |
| Instant UI feedback / optimistic updates | Journey 1, 2 |
| Visual distinction: active vs. completed | Journey 1, 3 |
| Data persistence across sessions | Journey 1, 3 |
| Empty state, loading state, error state | Journey 1, 2 |
| Input validation | Journey 2 |
| Error recovery and graceful degradation | Journey 2 |
| Responsive / mobile-friendly layout | Journey 3 |
| Touch-friendly interaction targets | Journey 3 |
| Cross-device data consistency | Journey 3 |

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — deliver the smallest complete product that lets a user manage tasks reliably. No feature is included unless it directly supports the core loop: add, view, complete, delete.

**Resource Requirements:** Single full-stack developer. The entire stack (frontend SPA, backend API, database, Docker config, tests) is buildable by one person in a focused sprint.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Journey 1 (Alex — Happy Path): Full CRUD lifecycle
- Journey 2 (Alex — Error Recovery): All error/edge case handling
- Journey 3 (Sam — Mobile): Responsive cross-device experience

**Must-Have Capabilities:**
- Create todo with text description
- View all todos on app load (single list)
- Toggle todo completion status
- Delete a todo
- Each todo: description, completion status, creation timestamp
- Persistent storage via REST API
- Optimistic UI updates
- Empty, loading, and error states
- Responsive layout (320px–1920px)
- Visual distinction between active and completed todos
- Input validation (empty description, length limits)
- Dockerized deployment (`docker-compose up`)
- Playwright E2E tests (minimum 5)
- Unit/integration test coverage (70%+)
- WCAG 2.1 AA compliance
- Framework comparison document
- README with setup instructions and AI integration log

### Phase 2: Growth

- User authentication and personal accounts
- Task editing (update description after creation)
- Filtering/sorting (active, completed, all)
- Due dates and reminders

### Phase 3: Expansion

- Multi-user with shared lists and collaboration
- Task prioritization and categorization
- Push notifications
- Offline-first with sync

### Risk Mitigation Strategy

**Technical Risks:**
- *Framework choice regret* — Mitigated by the framework comparison deliverable. Document the decision rationale before writing code so the choice is intentional, not accidental.
- *Optimistic UI complexity* — Keep it simple: optimistic add/complete/delete with rollback on API failure. No queuing, no retry logic, no offline cache.
- *Docker configuration drift* — Test `docker-compose up` from a clean state as part of CI or manual verification before delivery.

**Market Risks:**
- Minimal. This is not a market-facing product competing for users. Success is measured by completeness and quality of execution, not adoption.

**Resource Risks:**
- *Solo developer bottleneck* — The scope is sized for one developer. If time is constrained, the framework comparison doc and AI integration log are the most deferrable deliverables (they don't affect app functionality).
- *Test coverage target pressure* — 70% is achievable if tests are written alongside features, not bolted on after. Risk increases if testing is deferred to the end.

## Web Application Specific Requirements

### Project-Type Overview

bmad-todo-app is a single-page application (SPA) with a REST API backend. The frontend renders entirely in the browser, communicating with the server exclusively through JSON API calls. No server-side rendering, no multi-page navigation, no real-time push channels.

### Technical Architecture Considerations

- **SPA architecture** — Client-side routing and rendering. All UI state managed in the browser. API calls are the only server communication.
- **REST API** — Standard HTTP methods (GET, POST, PATCH, DELETE) over JSON. No WebSocket, SSE, or GraphQL requirements.
- **No SSR/SSG** — Server-side rendering is unnecessary. No SEO requirements for the application.
- **Stateless API** — No session management on the server for MVP. Each request is self-contained.

### Browser Support Matrix

| Browser | Version | Priority |
|---|---|---|
| Chrome | Latest stable | Primary |
| Firefox | Latest stable | Primary |
| Safari | Latest stable | Primary |
| Edge | Latest stable | Primary |
| Legacy / IE | Not supported | — |

No polyfills or transpilation for legacy browsers. Target ES2020+ baseline.

### Responsive Design

- **Mobile-first** approach — design for 320px minimum viewport, scale up.
- **Breakpoints:** Mobile (320–767px), Tablet (768–1023px), Desktop (1024px+).
- **Touch targets:** Minimum 44x44px for interactive elements per WCAG guidelines.
- **No horizontal scrolling** at any supported viewport width.
- **Input handling:** On-screen keyboard must not obscure the active input field.

### Performance Targets

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 2.0s |
| API response (CRUD operations) | < 200ms |
| UI feedback on user action | < 100ms (optimistic) |
| Bundle size (initial JS) | < 200KB gzipped |

### Accessibility Standards

- **Standard:** WCAG 2.1 AA compliance.
- **Zero critical violations** as measured by automated tooling (axe-core or equivalent).
- Keyboard navigation for all interactive elements.
- Proper ARIA labels on dynamic content (todo list, status changes, error messages).
- Sufficient color contrast ratios (4.5:1 for normal text, 3:1 for large text).
- Focus management after add/delete/complete actions.

### Excluded Concerns

- **SEO:** Not required. No meta tags, sitemap, or structured data needed.
- **Real-time:** Not required. Simple REST calls are sufficient for single-user MVP.
- **Offline:** Not in scope. App requires network connectivity.

## Functional Requirements

### Task Management

- FR1: User can create a new todo by entering a text description
- FR2: User can view all existing todos in a single list upon app load
- FR3: User can mark a todo as complete
- FR4: User can mark a completed todo as incomplete (toggle)
- FR5: User can delete a todo
- FR6: System stores a creation timestamp for each todo automatically

### Task Display & Status

- FR7: User can visually distinguish completed todos from active todos at a glance
- FR8: User can see the full list of todos without any navigation or authentication
- FR9: System displays todos with their description and completion status

### Input Handling & Validation

- FR10: System prevents creation of a todo with an empty or whitespace-only description
- FR11: System enforces a maximum length on todo descriptions
- FR12: System provides inline feedback when input validation fails

### Data Persistence

- FR13: System persists all todo data across browser sessions (page refresh, tab close, reopen)
- FR14: System persists all todo data across server restarts
- FR15: System maintains data consistency between the UI and the server after every operation

### UI State Management

- FR16: System displays an empty state when no todos exist
- FR17: System displays a loading state while fetching todos from the server
- FR18: System displays an error state when the server is unreachable or returns an error
- FR19: System provides user-friendly error messages (no raw technical errors exposed)
- FR20: System rolls back optimistic UI updates when the corresponding API call fails

### Responsive Experience

- FR21: User can perform all CRUD operations on mobile devices (320px viewport and up)
- FR22: User can perform all CRUD operations on desktop devices (up to 1920px viewport)
- FR23: System provides touch-friendly interaction targets on mobile viewports
- FR24: System adapts layout across mobile, tablet, and desktop breakpoints without horizontal scrolling

### Accessibility

- FR25: User can navigate and operate all interactive elements using keyboard only
- FR26: System provides appropriate ARIA labels for dynamic content and status changes
- FR27: System maintains visible focus indicators on interactive elements
- FR28: System manages focus appropriately after add, complete, and delete actions

### API

- FR29: System exposes a REST API supporting create, read, update, and delete operations for todos
- FR30: API accepts and returns JSON for all operations
- FR31: API returns appropriate HTTP status codes and error responses for invalid requests

## Non-Functional Requirements

### Performance

- NFR1: All API endpoints respond within 200ms under normal operating conditions.
- NFR2: UI reflects user actions (add, complete, delete) within 100ms via optimistic updates.
- NFR3: First Contentful Paint occurs within 1.5 seconds on a standard broadband connection.
- NFR4: Time to Interactive is under 2.0 seconds on a standard broadband connection.
- NFR5: Initial JavaScript bundle size does not exceed 200KB gzipped.

### Security

- NFR6: All user input is sanitized server-side before persistence to prevent injection attacks.
- NFR7: API validates request payloads and rejects malformed or unexpected data with appropriate error codes.
- NFR8: No sensitive server internals (stack traces, file paths, dependency versions) are exposed in API error responses.

### Reliability

- NFR9: Todo data survives browser refresh, tab closure, and browser restart without loss.
- NFR10: Todo data survives server restart without loss (durable storage, not in-memory).
- NFR11: Failed API calls do not leave the UI in an inconsistent state — optimistic updates are rolled back on failure.
- NFR12: The application degrades gracefully when the backend is unreachable, displaying a clear error state rather than crashing or showing a blank screen.

### Accessibility

- NFR13: Application meets WCAG 2.1 AA compliance with zero critical violations.
- NFR14: All interactive elements are operable via keyboard navigation.
- NFR15: Color contrast ratios meet minimum thresholds (4.5:1 normal text, 3:1 large text).
- NFR16: Dynamic content changes (todo added, completed, deleted, errors) are announced to assistive technologies.
- NFR17: Focus is managed predictably after state-changing actions (no focus loss).

### Deployment & Operations

- NFR18: Application starts and runs successfully via a single `docker-compose up` command with no manual configuration.
- NFR19: Application requires no external services beyond what is defined in the Docker Compose configuration.

### Testability

- NFR20: Codebase maintains minimum 70% meaningful test coverage (unit + integration).
- NFR21: Minimum 5 Playwright end-to-end tests pass against a running instance of the application.
- NFR22: Tests are deterministic — no flaky tests that pass/fail intermittently.
