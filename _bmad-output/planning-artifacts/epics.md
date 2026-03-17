---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['prd.md', 'architecture.md', 'ux-design-specification.md']
---

# aine-training - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for aine-training, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can view a list of all their tasks.
FR2: User can distinguish completed tasks from active tasks at a glance.
FR3: User can see the list as soon as the app is opened (no blocking delay before list is visible).
FR4: User can see creation time (or equivalent metadata) for each task.
FR5: User can add a new task with a short textual description.
FR6: User can add a task in one or two actions (e.g. focus + submit or equivalent).
FR7: User can see the new task appear in the list immediately after adding it.
FR8: User can mark a task as complete in one action.
FR9: User can mark a completed task as active again (toggle completion status).
FR10: User can delete a task in one or two actions.
FR11: User can confirm or execute deletion without navigating through multiple screens or menus.
FR12: User can change the textual description of an existing task.
FR13: User can edit a task in one or two actions (e.g. inline or single-step edit).
FR14: User can see the updated task in the list after editing.
FR15: User's tasks persist across browser refresh.
FR16: User's tasks persist across sessions (same browser/device).
FR17: System stores and retrieves task data via a well-defined API.
FR18: System supports a data model that can represent multiple users (e.g. user–task relationship) so auth can be added later without changing the model.
FR19: User sees a clear empty state when there are no tasks (e.g. "No tasks yet" and a clear way to add one).
FR20: User sees a loading state while task data is being fetched.
FR21: User sees a clear error state when the list cannot be loaded (e.g. network or server failure).
FR22: User can retry or recover from an error state (e.g. retry control or clear next step).
FR23: User is never left on a blank or cryptic screen when something goes wrong.
FR24: User can operate core actions (add, complete, delete, edit) via keyboard.
FR25: User can understand and use the interface without explanation or onboarding (self-explanatory UI).
FR26: System meets WCAG 2.1 Level AA for the task list and task actions (contrast, focus, labels, semantics, etc.).
FR27: User can use the app on desktop and mobile browsers (responsive layout and touch-friendly actions).
FR28: System supports the latest versions of major browsers (Chrome, Firefox, Safari, Edge) and mobile browsers (e.g. iOS Safari, Android Chrome).

### NonFunctional Requirements

NFR-P1: List load: the task list is visible and usable with no perceptible delay after the app is opened (e.g. first contentful response within a few seconds under normal conditions).
NFR-P2: Add task: the full flow from user intent to the new task appearing in the list completes within 10 seconds under normal conditions.
NFR-P3: Core actions (complete, delete, edit): the UI reflects the outcome within a few seconds or immediately via optimistic updates so that interactions feel instantaneous under normal conditions.
NFR-R1: Task data persists across browser refresh and sessions; no data loss under normal use (e.g. no unintended wipe on refresh or tab close).
NFR-R2: When the list cannot be loaded or an action fails (e.g. network or server error), the system surfaces a clear error state and a path to retry or recover; the user is not left on a blank or undefined screen.
NFR-S1: All client–server communication uses HTTPS (or equivalent) so data in transit is encrypted.
NFR-S2: The design does not require storing credentials or long-lived secrets in the client; the architecture allows adding authentication later without introducing insecure patterns in v1.
NFR-A1: The product meets WCAG 2.1 Level AA for the task list and all core task actions (contrast, focus, labels, semantics, keyboard operability). This is the minimum quality bar for accessibility.
NFR-V1: Critical user journeys (list load, add, complete, delete, edit, empty/loading/error states) are covered by automated end-to-end tests so regressions are caught before release.
NFR-V2: Core business logic (e.g. task state, persistence contract) is covered by unit tests so behavior can be changed safely.

### Additional Requirements

- **Starter template (Epic 1 Story 1):** Initialize project with Vite (React + TypeScript) frontend via `npm create vite@latest frontend -- --template react-ts`; Fastify backend via `npm init fastify backend`; add Tailwind CSS, Vitest, Playwright, Prettier, ESLint to frontend; add TypeScript, SQLite (e.g. better-sqlite3 or Drizzle), testing, Prettier to backend; two Dockerfiles (frontend, backend) and root docker-compose.yml for local full-stack run.
- **Infrastructure:** Docker Compose with `frontend` and `backend` services; frontend can proxy or use env for API URL; backend exposes API port; SQLite file persisted via volume; env config: VITE_API_URL (frontend), PORT, DATABASE_URL or DB_PATH (backend).
- **API contract:** REST over HTTP/JSON; GET/POST/PATCH/DELETE for tasks; Zod + fastify-type-provider-zod for request/response validation; error responses JSON `{ code, message }` with HTTP 4xx/5xx; success responses direct array or object (no `data` wrapper); camelCase in JSON; ISO 8601 dates.
- **Data layer:** Drizzle ORM + SQLite; schema with `tasks` table (id, description, completed, createdAt; optional user_id for auth-ready); Drizzle Kit for migrations.
- **Frontend server state:** TanStack Query for todos (fetch, cache, loading/error, retry); single view for MVP; component set per UX: TaskList, TaskCard, AddTaskRow, EmptyState, LoadingState, ErrorState.
- **CORS & security:** CORS allowed for frontend origin(s); security headers; HTTPS in production; no long-lived secrets in client.
- **Testing:** E2E (Playwright) for critical journeys; unit tests (Vitest) for API and core client logic; test placement: frontend e2e/ and co-located or __tests__; backend tests/ or co-located.

### UX Design Requirements

UX-DR1: Implement design tokens for color (background, surface, text-primary, text-secondary, text-muted, border, primary, focus-ring, error), typography (font stack, sizes, weights, line heights), and spacing (base unit and scale) and use them in utility classes and components.
UX-DR2: Implement AddTaskRow component: text input + primary button ("Add"); placeholder "Add a task"; states default, focus, disabled, error; label or aria-label; Enter submits; clear input and update list on submit.
UX-DR3: Implement TaskCard component: card container per Direction C (background, border, border-radius, padding); checkbox + task text (or inline edit field) + delete control; states default, completed (strikethrough + muted), editing, focus; checkbox label and aria-label "Delete task" for delete; Tab order checkbox → text/edit → delete; Space toggles complete; Enter saves edit.
UX-DR4: Implement TaskList component: wrapper (max-width, padding) containing AddTaskRow then list of TaskCards or EmptyState/LoadingState/ErrorState; render one of loading / empty / error / list based on data and API state; role="list" and list item semantics.
UX-DR5: Implement EmptyState component: message "No tasks yet" and visible add affordance (AddTaskRow or "Add your first task"); message and add control focusable and screen-reader accessible.
UX-DR6: Implement LoadingState component: spinner or skeleton list (e.g. 3–4 placeholder cards); aria-live="polite" or aria-busy="true" and accessible text "Loading tasks".
UX-DR7: Implement ErrorState component: message (e.g. "Couldn't load tasks") + Retry button; aria-live for error; Retry focusable and labeled; Retry triggers refetch.
UX-DR8: Apply Direction C visual treatment: add at top; each task in a light card (background + border, rounded corners, padding); gap between cards; one primary accent for Add; strikethrough and muted for completed; reference ux-design-directions.html Direction C for exact styling.
UX-DR9: Meet WCAG 2.1 AA: contrast 4.5:1 normal text and 3:1 large text/UI; visible focus indicator (e.g. 2px outline) on all interactive elements; semantic markup (list, input, button, label); keyboard operability (add, complete, edit, delete, retry); completed/error state not conveyed by color alone (strikethrough, icon, or text).
UX-DR10: Responsive layout: single fluid layout for all screen sizes; max-width container (e.g. 480px–560px) centered on desktop; full-bleed or narrow padding on mobile; minimum 44×44px touch targets for checkbox, delete, Add button, Retry; adequate spacing between interactive elements.
UX-DR11: Button hierarchy: primary for "Add" and "Retry" (primary token); secondary/ghost for delete and edit (icon or text, muted); one primary button visible at a time in list view.
UX-DR12: Form and feedback patterns: add task single input + submit, trim whitespace, inline error if API fails; inline edit activate by click on label or edit control, save on blur or Enter, cancel on Escape, one active edit at a time; loading = spinner/skeleton + aria-busy; error = message + retry; empty = "No tasks yet" + add affordance.

### FR Coverage Map

FR1: Epic 1 - View list (including empty list).
FR2: Epic 2 - Distinguish completed vs active at a glance.
FR3: Epic 2 - List visible on open with no blocking delay.
FR4: Epic 2 - Creation time (or metadata) per task.
FR5: Epic 3 - Add new task with short description.
FR6: Epic 3 - Add task in one or two actions.
FR7: Epic 3 - New task appears in list immediately.
FR8: Epic 4 - Mark task complete in one action.
FR9: Epic 4 - Mark completed task active again (toggle).
FR10: Epic 4 - Delete task in one or two actions.
FR11: Epic 4 - Confirm or execute deletion without deep menus.
FR12: Epic 5 - Change textual description of existing task.
FR13: Epic 5 - Edit task in one or two actions.
FR14: Epic 5 - Updated task visible in list after edit.
FR15: Epic 2 - Tasks persist across browser refresh.
FR16: Epic 2 - Tasks persist across sessions.
FR17: Epic 1 - System stores/retrieves task data via API.
FR18: Epic 1 - Data model supports future multi-user (auth-ready).
FR19: Epic 1 - Clear empty state with way to add.
FR20: Epic 1 - Loading state while fetching.
FR21: Epic 1 - Clear error state when list cannot load.
FR22: Epic 1 - Retry or recover from error state.
FR23: Epic 1 - No blank or cryptic screen when something goes wrong.
FR24: Epic 6 - Operate core actions via keyboard.
FR25: Epic 6 - Self-explanatory UI, no onboarding.
FR26: Epic 6 - WCAG 2.1 Level AA for list and actions.
FR27: Epic 6 - Use on desktop and mobile (responsive, touch-friendly).
FR28: Epic 6 - Support latest major and mobile browsers.

## Epic List

### Epic 1: Runnable app and empty list experience
User can open the app and see a clear state: loading, then either an empty list with an obvious way to add a task, or an error state with retry. The backend API and persistence exist; the frontend loads and shows one of these states so the user is never on a blank or confusing screen.
**FRs covered:** FR1, FR17, FR18, FR19, FR20, FR21, FR22, FR23.

### Epic 2: View persisted task list
User can see their saved tasks with completed vs active clearly distinguished and creation time visible; the list appears as soon as the app is opened with no blocking delay; data persists across refresh and sessions.
**FRs covered:** FR2, FR3, FR4, FR15, FR16.

### Epic 3: Add tasks
User can add a new task with a short description in one or two actions and see the new task appear in the list immediately.
**FRs covered:** FR5, FR6, FR7.

### Epic 4: Complete and delete tasks
User can mark a task complete (or active again) in one action and delete a task in one or two actions without navigating through multiple screens or menus.
**FRs covered:** FR8, FR9, FR10, FR11.

### Epic 5: Edit tasks
User can change the textual description of an existing task in one or two actions (e.g. inline or single-step edit) and see the updated task in the list.
**FRs covered:** FR12, FR13, FR14.

### Epic 6: Accessibility, responsiveness, and quality
User can operate all core actions via keyboard; the interface is self-explanatory without onboarding; the app meets WCAG 2.1 Level AA, works on desktop and mobile with responsive layout and touch-friendly actions, and supports latest major and mobile browsers. Critical journeys and core logic are covered by automated tests.
**FRs covered:** FR24, FR25, FR26, FR27, FR28.

---

## Epic 1: Runnable app and empty list experience

User can open the app and see a clear state: loading, then either an empty list with an obvious way to add a task, or an error state with retry. The backend API and persistence exist; the frontend loads and shows one of these states so the user is never on a blank or confusing screen.

### Story 1.1: Project scaffold and runnable full-stack app

As a developer,
I want a monorepo with frontend and backend running via Docker,
So that I can open the app in a browser and have a working shell with the backend API available.

**Acceptance Criteria:**

**Given** the repo root
**When** I run `docker-compose up` (or run frontend and backend per README)
**Then** the frontend serves a single-page app (e.g. Vite dev server or built assets) and the backend serves on its configured port
**And** the frontend can call the backend (env `VITE_API_URL` or proxy)
**And** Frontend: Vite + React + TypeScript; Tailwind, Prettier, ESLint added. Backend: Fastify with TypeScript and Prettier. Two Dockerfiles and root `docker-compose.yml`.

### Story 1.2: Backend todo API and SQLite persistence

As a user,
I want the app to store and retrieve tasks via an API,
So that my list can persist and support future features.

**Acceptance Criteria:**

**Given** the backend is running
**When** I send `GET /api/todos` (or agreed base path)
**Then** I receive 200 and a JSON array of tasks (empty array if none)
**And** Task shape: `id`, `description`, `completed`, `createdAt` (camelCase, ISO 8601 for date)
**And** Persistence uses Drizzle ORM + SQLite; table `tasks` with columns `id`, `description`, `completed`, `created_at`, and optional `user_id`; migrations via Drizzle Kit
**And** Request/response validated with Zod; errors return JSON `{ code, message }` with appropriate HTTP status; CORS allows frontend origin

### Story 1.3: Frontend fetch and loading state

As a user,
I want to see a loading state while my task list is being fetched,
So that I know the app is working and not stuck.

**Acceptance Criteria:**

**Given** the frontend is open and the list is being fetched
**When** the request is in progress
**Then** the UI shows a loading state (spinner or skeleton list)
**And** Loading state is announced to assistive tech (e.g. aria-busy or aria-live and "Loading tasks")
**And** TanStack Query is used for the fetch; no blank screen while loading

### Story 1.4: Empty state when there are no tasks

As a user,
I want to see a clear empty state when I have no tasks,
So that I know the app is working and how to add my first task.

**Acceptance Criteria:**

**Given** `GET /api/todos` returns an empty array
**When** the frontend has finished loading
**Then** the UI shows an empty state with a short message (e.g. "No tasks yet")
**And** There is an obvious add affordance (e.g. add input or "Add your first task" control)
**And** The empty state and add affordance are focusable and screen-reader accessible

### Story 1.5: Error state and retry when list fails to load

As a user,
I want to see a clear error state and a way to retry when the list cannot be loaded,
So that I am never left on a blank or cryptic screen.

**Acceptance Criteria:**

**Given** the list fetch fails (e.g. network or server error)
**When** the frontend receives an error
**Then** the UI shows an error state with a clear message (e.g. "Couldn't load tasks")
**And** A Retry control is visible and focusable; activating it triggers a refetch
**And** The error message is announced (e.g. aria-live) and the user is never on a blank screen

---

## Epic 2: View persisted task list

User can see their saved tasks with completed vs active clearly distinguished and creation time visible; the list appears as soon as the app is opened with no blocking delay; data persists across refresh and sessions.

### Story 2.1: Display task list with TaskCards

As a user,
I want to see my tasks in a list with completed vs active clearly distinguished and creation time visible,
So that I can scan my list and know what is done and when I added each task.

**Acceptance Criteria:**

**Given** `GET /api/todos` returns one or more tasks
**When** the frontend has loaded the list
**Then** each task is shown in a card (Direction C: light background, border, rounded corners, padding) with a checkbox, description, and creation time
**And** Completed tasks are visually distinct (e.g. strikethrough and muted color); active tasks are primary
**And** The list uses semantic list markup (e.g. role="list") and a max-width container with padding; cards have a gap between them
**And** List is visible with no blocking delay after open (NFR-P1)

### Story 2.2: TaskList container and state routing

As a user,
I want the app to show exactly one of: loading, empty, error, or list,
So that I always see a clear state and know what to do next.

**Acceptance Criteria:**

**Given** the TaskList component is rendered
**When** data and API state are available
**Then** the UI shows exactly one of: LoadingState (while loading), EmptyState (when list is empty), ErrorState (when fetch failed), or the list of TaskCards (when data exists)
**And** AddTaskRow (or add affordance) is at the top of the list area
**And** After refresh or a new session, the same list loads from the API and persists (FR15, FR16)

---

## Epic 3: Add tasks

User can add a new task with a short description in one or two actions and see the new task appear in the list immediately.

### Story 3.1: Create task API (POST)

As a user,
I want to create a new task via the API,
So that I can add tasks from the UI and have them persisted.

**Acceptance Criteria:**

**Given** the backend is running
**When** I send `POST /api/todos` with body `{ "description": "string" }`
**Then** the request is validated with Zod (non-empty description or per product rule)
**And** On success I receive 201 and the created task object (id, description, completed, createdAt)
**And** On validation failure I receive 400 with `{ code, message }`; the task is stored in SQLite

### Story 3.2: AddTaskRow and add task in UI

As a user,
I want to add a task by typing and submitting in one or two actions,
So that the new task appears in the list right away without extra steps.

**Acceptance Criteria:**

**Given** the list is visible (empty or with tasks)
**When** I focus the add input, type a description, and submit (Enter or Add button)
**Then** a new task is created via POST and appears in the list (optimistic or after response)
**And** The input clears after successful add; description is trimmed
**And** AddTaskRow has a visible label or aria-label; Enter submits; flow completes in under 10 seconds under normal conditions (NFR-P2)
**And** If the API returns an error, an inline error is shown and the user can correct or retry (UX-DR12)

---

## Epic 4: Complete and delete tasks

User can mark a task complete (or active again) in one action and delete a task in one or two actions without navigating through multiple screens or menus.

### Story 4.1: Complete task API and checkbox toggle

As a user,
I want to mark a task complete or active again with one action,
So that I can track progress without extra steps.

**Acceptance Criteria:**

**Given** a task is displayed in the list
**When** I toggle the task's checkbox (or equivalent control)
**Then** the app sends PATCH to the API with `{ completed: true | false }` and the list updates (invalidate or optimistic)
**And** The UI reflects the new state immediately (NFR-P3); completed tasks show strikethrough and muted styling
**And** Checkbox has correct label/association for accessibility

### Story 4.2: Delete task API and delete control

As a user,
I want to delete a task in one or two actions without opening menus,
So that I can remove tasks quickly and clearly.

**Acceptance Criteria:**

**Given** a task is displayed in the list
**When** I activate the delete control (e.g. icon button with aria-label "Delete task")
**Then** the app sends DELETE to the API for that task and removes it from the list
**And** No multi-step menu or confirmation is required (or one lightweight confirm if product specifies)
**And** The control is visible or clearly reachable (not hover-only) and works with keyboard and touch

---

## Epic 5: Edit tasks

User can change the textual description of an existing task in one or two actions (e.g. inline or single-step edit) and see the updated task in the list.

### Story 5.1: Edit task API and inline edit in TaskCard

As a user,
I want to change a task's description in place with one or two actions,
So that I can fix or update text without leaving the list.

**Acceptance Criteria:**

**Given** a task is displayed in the list
**When** I activate edit (e.g. click the task label or an edit control)
**Then** the label becomes an inline input (or single-step edit flow); I can change the text and save (blur or Enter) or cancel (Escape)
**And** On save, the app sends PATCH with `{ description }` and the list updates; only one task is in edit mode at a time
**And** The updated task is visible in the list after save (FR14); validation (e.g. non-empty) and inline error follow UX-DR12

---

## Epic 6: Accessibility, responsiveness, and quality

User can operate all core actions via keyboard; the interface is self-explanatory without onboarding; the app meets WCAG 2.1 Level AA, works on desktop and mobile with responsive layout and touch-friendly actions, and supports latest major and mobile browsers. Critical journeys and core logic are covered by automated tests.

### Story 6.1: Design tokens and Direction C visual polish

As a user,
I want a consistent, minimal visual design with clear hierarchy,
So that the app feels calm and readable and I can focus on my list.

**Acceptance Criteria:**

**Given** the app is implemented
**When** I view any screen
**Then** colors, typography, and spacing use a defined token set (background, surface, text-primary, text-secondary, text-muted, border, primary, focus-ring, error; font stack, sizes, line heights; base spacing unit and scale)
**And** Direction C is applied: add at top, tasks in cards with gap; one primary accent for Add (and Retry); strikethrough and muted for completed
**And** Button hierarchy is consistent: primary for Add and Retry; secondary/ghost for delete and edit (UX-DR11)

### Story 6.2: Keyboard operability and WCAG 2.1 Level AA

As a user,
I want to use the app with the keyboard and have clear focus and semantics,
So that I can add, complete, edit, delete, and retry without a mouse and with assistive tech.

**Acceptance Criteria:**

**Given** the app is open
**When** I use only the keyboard
**Then** I can focus and activate add input, Add button, each task's checkbox, label/edit, delete, and Retry
**And** Tab order is logical (e.g. add input → Add → tasks in order); focus is visible (e.g. 2px outline) on all interactive elements
**And** Semantic markup is used (form, list, listitem, button, label); completed and error states are not conveyed by color alone (strikethrough, icon, or text)
**And** Contrast meets WCAG 2.1 AA (4.5:1 normal text, 3:1 large text and UI); the interface is self-explanatory (FR25, FR26, NFR-A1, UX-DR9)

### Story 6.3: Responsive layout and touch targets

As a user,
I want the app to work on desktop and mobile with comfortable touch targets,
So that I can use it on any device without mis-taps or cramped controls.

**Acceptance Criteria:**

**Given** I open the app on desktop or mobile
**When** I view the list and actions
**Then** the layout is a single fluid column; desktop uses a max-width container (e.g. 480px–560px) centered; mobile uses full-bleed or narrow padding
**And** Checkbox, delete control, Add button, and Retry have a minimum 44×44px touch target with adequate spacing (FR27, FR28, UX-DR10)
**And** The app is usable in latest Chrome, Firefox, Safari, Edge and typical mobile browsers

### Story 6.4: E2E and unit test coverage

As a developer,
I want critical user journeys and core logic covered by automated tests,
So that regressions are caught before release and changes are safe.

**Acceptance Criteria:**

**Given** the codebase
**When** I run the test suite
**Then** Playwright E2E tests cover: open app (loading → empty or list), add task, complete task, delete task, edit task, error state and retry
**And** Vitest (or equivalent) unit tests cover: backend todo routes (GET, POST, PATCH, DELETE) and validation/error responses; and core client logic (e.g. todo state or API client) where appropriate
**And** Tests are in the agreed layout (e.g. frontend e2e/, backend tests/ or co-located) (NFR-V1, NFR-V2)
