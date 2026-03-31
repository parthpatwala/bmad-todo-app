# How BMAD Guided the Implementation of bmad-todo-app

## What is BMAD?

BMAD (Breakthrough Method of Agile AI-Driven Development) is a structured methodology for building software using AI agents. It provides specialized agent personas — each with a defined role — that collaborate through a disciplined workflow of planning, specification, implementation, and review. The methodology ensures AI-generated code follows a coherent architecture, meets acceptance criteria, and undergoes adversarial review before being marked complete.

BMAD version 6.2.2 was used for this project.

## The BMAD Workflow

The project followed BMAD's standard lifecycle:

```
PRD Creation → Architecture Design → Epic/Story Breakdown → Sprint Planning
    ↓
For each story:
    Story Creation → Story Development → Code Review → Done
```

### Phase 1: Planning Artifacts

Three planning artifacts were generated before any code was written:

**1. Product Requirements Document (PRD)**
- Agent: John (Product Manager)
- Skill: `bmad-create-prd`
- Output: `_bmad-output/planning-artifacts/prd.md`
- Process: 12-step guided workflow covering discovery, vision, executive summary, user journeys, domain modeling, scoping, functional requirements (FR1-FR31), and non-functional requirements (NFR1-NFR10)
- Result: 31 functional requirements and 10 non-functional requirements defining the complete Todo application

**2. Architecture Decision Document**
- Agent: Winston (Architect)
- Skill: `bmad-create-architecture`
- Output: `_bmad-output/planning-artifacts/architecture.md`
- Process: 8-step workflow analyzing the PRD, making technology decisions, defining patterns, and specifying project structure
- Key decisions: React 19 + Vite frontend, Fastify 5 + Drizzle ORM backend, PostgreSQL 16, Docker Compose deployment, REST API with JSON schema validation, optimistic UI updates via TanStack Query

**3. Epic and Story Breakdown**
- Agent: Bob (Scrum Master)
- Skill: `bmad-create-epics-and-stories`
- Output: `_bmad-output/planning-artifacts/epics.md`
- Process: 4-step workflow validating prerequisites, designing epics, creating stories with acceptance criteria, and final validation
- Result: 5 epics with 11 stories, each with detailed acceptance criteria mapped to functional requirements

### Phase 2: Sprint Execution

Sprint planning was run via `bmad-sprint-planning`, producing `sprint-status.yaml` to track story status through the lifecycle: `backlog → ready-for-dev → in-progress → review → done`.

For each of the 11 stories, the following cycle was executed:

**Story Creation** (`bmad-create-story`)
- Reads the epic backlog and architecture docs
- Incorporates learnings from previously completed stories ("Previous Story Intelligence")
- Produces a detailed story file with acceptance criteria, task breakdown, dev notes, file lists, naming conventions, and scope boundaries
- Output: `_bmad-output/implementation-artifacts/{story-key}.md`

**Story Development** (`bmad-dev-story`)
- Agent: Amelia (Developer)
- Reads the story file as its complete specification
- Implements all tasks and subtasks
- Runs tests to verify acceptance criteria
- Moves story to `review` status
- Appends a Dev Agent Record with completion notes, debug logs, and change log

**Code Review** (`bmad-code-review`)
- Launches 3 parallel adversarial review layers:
  - **Blind Hunter**: Reviews the diff with zero context (no spec, no project access)
  - **Edge Case Hunter**: Reviews the diff with project read access, traces every branching path
  - **Acceptance Auditor**: Reviews the diff against the story spec and acceptance criteria
- Findings are triaged into: `patch` (fix now), `decision_needed` (human input required), `defer` (log for later), `dismiss` (noise)
- Patches are applied, deferred items logged to `deferred-work.md`
- Story marked `done` if all issues resolved

### Phase 3: QA and Hardening

After all stories were complete, additional QA activities were performed outside the BMAD story cycle:
- Security review (AI-driven code audit)
- Lighthouse performance testing (automated via Playwright)
- Test coverage reporting (Vitest with v8 coverage)
- Docker hardening (non-root user)

## Artifacts Produced

| Artifact | Path | Purpose |
|----------|------|---------|
| PRD | `_bmad-output/planning-artifacts/prd.md` | Requirements specification |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` | Technical design decisions |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` | Work breakdown structure |
| Sprint Status | `_bmad-output/implementation-artifacts/sprint-status.yaml` | Progress tracking |
| Story Files (x11) | `_bmad-output/implementation-artifacts/{story-key}.md` | Detailed implementation specs |
| Deferred Work | `_bmad-output/implementation-artifacts/deferred-work.md` | Accumulated low-priority findings |
| Security Review | `_bmad-output/implementation-artifacts/security-review.md` | Security audit findings |

## Epic Summary

| Epic | Description | Stories | Status |
|------|-------------|---------|--------|
| Epic 1 | Project Foundation & Core Task Management | 1.1 Scaffolding, 1.2 API CRUD, 1.3 UI Components | Done |
| Epic 2 | Input Validation & Error Resilience | 2.1 Validation & Feedback, 2.2 Loading/Empty/Error States | Done |
| Epic 3 | Responsive Design & Mobile Experience | 3.1 Responsive Layout & Touch | Done |
| Epic 4 | Accessibility | 4.1 Keyboard & Focus, 4.2 Screen Reader & ARIA | Done |
| Epic 5 | Testing & Production Deployment | 5.1 Unit/Integration Tests, 5.2 E2E Tests, 5.3 Docker Build | Done |

## BMAD Agents Used

| Agent | Persona | Role in Project |
|-------|---------|-----------------|
| John | Product Manager | Created the PRD through guided discovery |
| Winston | Architect | Designed technical architecture and made technology decisions |
| Bob | Scrum Master | Broke requirements into epics/stories, ran sprint planning |
| Amelia | Developer | Implemented each story following the spec files |
| Quinn | QA Engineer | (Implicit) Test strategy defined in stories 5.1 and 5.2 |

## BMAD Skills Used

| Skill | Times Used | Purpose |
|-------|-----------|---------|
| `bmad-create-prd` | 1 | Generate product requirements document |
| `bmad-create-architecture` | 1 | Generate architecture decision document |
| `bmad-create-epics-and-stories` | 1 | Break requirements into epics and stories |
| `bmad-sprint-planning` | 1 | Generate sprint status tracking |
| `bmad-create-story` | 11 | Create detailed story files from backlog |
| `bmad-dev-story` | 11 | Implement stories following spec files |
| `bmad-code-review` | 11 | Adversarial review of each story's changes |

## Key Observations

### What Worked Well

1. **Specification-first approach**: Every line of code was written against a spec. The story files contained exact file lists, naming conventions, and scope boundaries, which eliminated ambiguity during implementation.

2. **Previous Story Intelligence**: Each new story file incorporated learnings from completed stories. This prevented recurring issues — for example, after Story 5.2 discovered that Playwright's `check()` doesn't work with React-managed checkboxes, this was documented and available for future reference.

3. **Adversarial code review**: The 3-layer parallel review (Blind Hunter + Edge Case Hunter + Acceptance Auditor) caught real issues that a single-pass review would miss. Across 11 reviews, findings included missing `fastify-plugin` wrappers, SPA fallback serving HTML for API 404s, and accessibility contrast issues.

4. **Deferred work tracking**: Low-priority findings weren't lost — they accumulated in `deferred-work.md` across all reviews, creating a ready-made backlog for future hardening.

5. **Incremental complexity**: The epic ordering (foundation → validation → responsive → accessibility → testing → deployment) meant each layer built on a stable base. QA was integrated throughout, not bolted on at the end.

### Challenges Encountered

1. **Environment-specific issues**: The Playwright setup required debugging sandbox-specific problems (browser architecture mismatches, `CI=1` affecting `reuseExistingServer`, `NODE_ENV=test` triggering production code paths). These were resolved during development but added overhead.

2. **Story granularity**: Some stories (like 3.1 Responsive Layout) were large enough that they could have been split further. The single-story-per-epic pattern for Epics 3 was efficient but reduced the review-feedback loop.

3. **QA tasks outside BMAD**: Performance testing, security review, and Docker hardening didn't map cleanly to the BMAD story lifecycle. These were handled as ad-hoc tasks after the formal sprint was complete.

## Test Coverage

| Suite | Tests | Statements | Branches | Functions | Lines |
|-------|-------|-----------|----------|-----------|-------|
| Backend (Vitest) | 19 | 77.94% | 77.14% | 78.57% | 77.94% |
| Frontend (Vitest) | 55 | 82.16% | 78.26% | 76.47% | 83.33% |
| E2E (Playwright) | 5 | N/A | N/A | N/A | N/A |
| Lighthouse | 1 | N/A | N/A | N/A | N/A |
| **Total** | **80** | | | | |

## Conclusion

BMAD provided a structured, repeatable process for building a full-stack application with AI agents. The methodology's value was most apparent in three areas: (1) the planning phase produced specifications detailed enough that implementation was largely mechanical, (2) the adversarial code review caught issues that would have shipped otherwise, and (3) the artifact trail (PRD → Architecture → Stories → Reviews → Deferred Work) created full traceability from requirements to code.
