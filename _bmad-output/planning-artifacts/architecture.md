---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['prd.md', 'ux-design-specification.md', 'ux-design-directions.html']
workflowType: 'architecture'
project_name: 'aine-training'
user_name: 'Ben'
date: '2026-03-17'
lastStep: 8
status: 'complete'
completedAt: '2026-03-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines 28 functional requirements in clear groups: task list display (FR1–4), task creation (5–7), completion (8–9), deletion (10–11), editing (12–14), persistence and data (15–18), empty/loading/error states (19–23), accessibility and usability (24–26), and cross-device/browser (27–28). Architecturally this implies: a single list view with CRUD over tasks, a well-defined API for persistence, a data model that supports a future user–task relationship (auth-ready), and first-class handling of loading, empty, and error states in the UI. The UX spec refines this into concrete components (AddTaskRow, TaskCard, TaskList, EmptyState, LoadingState, ErrorState) and chooses Direction C (card-style list items, add at top), with utility-first CSS and design tokens.

**Non-Functional Requirements:**

- **Performance (NFR-P1–P3):** List visible with no perceptible delay; add-task flow &lt; 10s; core actions feel instant (e.g. optimistic UI or fast response). Drives: fast initial load, efficient API, and optional optimistic updates.
- **Reliability (NFR-R1–R2):** Data persists across refresh and sessions; clear error state and retry path. Drives: durable backend store and consistent error handling in API and client.
- **Security (NFR-S1–S2):** HTTPS in transit; no credentials or long-lived secrets in client; design allows adding auth later. Drives: API-first boundary and auth-ready model without v1 auth implementation.
- **Accessibility (NFR-A1):** WCAG 2.1 Level AA for list and all task actions. Drives: semantic markup, keyboard operability, focus order, contrast, and non-color state cues (e.g. strikethrough for completed).
- **Verification (NFR-V1–V2):** E2E for critical journeys; unit tests for core business logic. Drives: testable API and front-end structure.

**Scale & Complexity:**

- **Primary domain:** Full-stack web (SPA + API). UI and API are first-class; API is the persistence and extension boundary.
- **Complexity level:** Low, with intentional extension points. v1 is simple CRUD; no real-time, multi-tenancy, or regulatory complexity.
- **Estimated architectural components:** Client: one SPA (list view, add/edit/complete/delete, loading/empty/error); server: REST (or equivalent) API for tasks; persistence: single data store (e.g. SQL or document DB); optional deployment/DevOps for host and HTTPS.

### Technical Constraints & Dependencies

- **Application model:** SPA—single entry point, client-side state; server returns data (e.g. JSON), not full HTML for task operations.
- **Real-time:** Not in v1; updates via request/response or optimistic UI only.
- **API boundary:** Clear frontend/backend separation; API contract stable and designed for future auth and multi-user (user–todo relationship in model).
- **Stack:** PRD and UX are stack-agnostic (no mandated framework); UX specifies utility-first CSS (e.g. Tailwind) and a small set of custom components.
- **Browser and device:** Latest major browsers (Chrome, Firefox, Safari, Edge) and mobile browsers; responsive layout and touch-friendly targets (e.g. 44px minimum).
- **Offline:** Out of scope for v1.

### Cross-Cutting Concerns Identified

- **State and feedback:** Loading, empty, and error states must be consistent across list load and all mutations (add, complete, edit, delete); drives a clear client state model and API error contract.
- **Accessibility:** WCAG 2.1 AA affects markup, focus, keyboard order, and styling (contrast, non-color state); applies to every interactive component (AddTaskRow, TaskCard, TaskList, EmptyState, ErrorState).
- **Auth-ready design:** Data model and API should support a future user–task relationship and auth without rework; no auth implementation in v1.
- **Responsive and touch:** Single layout for desktop and mobile; touch targets and spacing (e.g. from UX Direction C) affect component and layout choices.
- **Testability:** E2E coverage for journeys and unit tests for business logic require a testable API and separable client logic (e.g. services/hooks that can be mocked).

---

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack with separate frontend and backend** — React (TypeScript) SPA and Node (Fastify, TypeScript) API, each in its own container, to support future separate hosting (frontend: S3 + CloudFront; backend: EKS). SQLite for persistence in v1; Docker for local and eventual deployment.

### Technical Preferences (Confirmed)

| Area | Choice | Notes |
|------|--------|--------|
| Language | TypeScript | Frontend and backend |
| Frontend | React | SPA |
| Backend | Node + Fastify | API server |
| Database | SQLite | For now; backend owns persistence |
| Containers | Docker, separate front & back | Two containers; later frontend from S3/CloudFront, backend on EKS |
| Testing | Must-have | Unit + E2E |
| Formatting | Prettier | Defaults for TS/React/Node |

### Starter Options Considered

- **Single full-stack starter (T3, Next.js API routes, etc.):** Rejected — deployment model requires separate frontend and backend artifacts and containers; a monolith would conflict with S3/CloudFront + EKS split.
- **Vite (React + TypeScript):** Chosen for frontend. Official, fast, and widely used; React + TS template is first-class. Tailwind, Vitest, Playwright, and Prettier are added after scaffold.
- **create-fastify (Fastify):** Chosen for backend. Official scaffold; generates a Fastify app that we then convert to TypeScript and add SQLite, testing, and Prettier. Alternative TS-specific generators exist but official starter keeps the stack simple and well-documented.
- **Docker:** No single “starter”; we define two Dockerfiles (frontend, backend) and a root `docker-compose.yml` so both run locally and can be built/deployed independently later.

### Selected Starters

**Frontend:** Vite with React + TypeScript template.  
**Backend:** Fastify via create-fastify, with TypeScript and SQLite added.  
**Orchestration:** Custom Docker setup (two services).

### Rationale for Selection

- **Vite** — Fast dev server and HMR, native TypeScript, simple config. Fits UX requirement for utility-first CSS (Tailwind added explicitly) and supports Vitest + Playwright for testing. Build output is static assets, suitable for S3/CloudFront.
- **Fastify** — Lightweight, fast Node HTTP server with a clear plugin model and TypeScript support. Fits “Node, Fastify” preference and API-as-boundary; SQLite (e.g. better-sqlite3 or Drizzle) is added in implementation.
- **Separate containers** — Aligns with hosting plan (frontend and backend deployed separately); docker-compose provides one-command local dev and clear separation of concerns.

### Initialization Commands

**Frontend (from repo root, e.g. in `frontend/` or create then move):**

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
```

Then add (as implementation steps): Tailwind CSS, Vitest, Playwright, Prettier (defaults), ESLint. Testing and formatting are must-haves.

**Backend (from repo root, e.g. in `backend/`):**

```bash
npm init fastify backend
cd backend && npm install
```

Then add: TypeScript (tsconfig, build/run with tsx or tsc), SQLite (e.g. better-sqlite3 or Drizzle + better-sqlite3), testing (Vitest or Node test runner), Prettier (defaults). No single CLI provides all of these; they are part of the first implementation stories.

**Docker:**

- `frontend/Dockerfile` — Build React app (e.g. `npm run build`) and serve with nginx or similar for production; dev can run Vite in container.
- `backend/Dockerfile` — Node image, install deps, run Fastify (compiled or via tsx).
- Root `docker-compose.yml` — Services `frontend` and `backend`; backend exposes API port; frontend can proxy to backend in dev or use env for API URL.

Project initialization using these commands (and adding Tailwind, testing, Prettier, TypeScript on backend, SQLite) should be the first implementation stories.

### Architectural Decisions Provided by Starters

**Frontend (Vite + React + TypeScript)**

| Area | Decision |
|------|----------|
| Language & runtime | TypeScript, ESM; Node 20+ for tooling |
| Build & dev | Vite; dev server, production build to static assets |
| Styling | To be added: Tailwind CSS (per UX spec) |
| Testing | To be added: Vitest (unit), Playwright (E2E) |
| Formatting | To be added: Prettier (defaults for TS/React) |
| Code organization | `src/` with main entry; component structure per UX (TaskList, TaskCard, AddTaskRow, etc.) |

**Backend (Fastify + TypeScript + SQLite)**

| Area | Decision |
|------|----------|
| Language & runtime | TypeScript; run with tsx or tsc |
| Server | Fastify; plugin-based; JSON API for todos |
| Database | SQLite (better-sqlite3 or Drizzle); file-based for v1 |
| Testing | To be added: Vitest or Node test runner; API and unit tests |
| Formatting | To be added: Prettier (defaults for Node/TS) |
| Code organization | Routes/plugins structure; persistence layer behind API so auth can be added later |

**Docker**

| Area | Decision |
|------|----------|
| Containers | Two: `frontend`, `backend` |
| Frontend image | Multi-stage: build with Node, serve with nginx (prod) or run Vite (dev) |
| Backend image | Node; install deps, run Fastify (TS compiled or tsx) |
| Networking | docker-compose defines services; frontend can call backend via service name |
| Volumes | SQLite file persisted via volume for backend; optional source mount for dev |

**Note:** Project initialization (Vite frontend, Fastify backend, Docker setup, plus Tailwind, testing, Prettier, TypeScript backend, SQLite) is the first implementation story. Each app can be developed and tested in isolation; Docker composes them for local full-stack runs and mirrors the future separate deployment (S3/CloudFront + EKS).

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- **Data layer:** Drizzle ORM + SQLite (schema, migrations, type-safe queries); auth-ready schema (e.g. optional `user_id` on tasks).
- **API contract:** REST JSON API for todos (CRUD); consistent error response shape; request/response validation at API boundary.
- **Frontend server state:** TanStack Query (React Query) for todos (fetch, cache, loading/error, retry) so list load and mutations align with PRD/UX.
- **API validation:** Zod schemas with Fastify type provider (`fastify-type-provider-zod`) for request/response validation and type inference.

**Important Decisions (Shape Architecture):**

- **Single view:** No client-side router for MVP; one list view with loading/empty/error/list states per UX.
- **CORS & security:** CORS allowed for frontend origin(s); security headers (e.g. helmet-style); HTTPS in production.
- **Error format:** JSON errors with `code` (or `status`) and `message`; HTTP status codes for client handling.
- **Env configuration:** Environment variables for API base URL (frontend), database path and server port (backend).

**Deferred Decisions (Post-MVP):**

- Authentication and authorization (model and API ready; implementation deferred).
- OpenAPI/Swagger docs (optional; can add when needed).
- Rate limiting, caching, monitoring, and logging (defer until required).
- CI/CD pipeline and production deployment automation (implementation story).

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | SQLite | Confirmed in step 3; file-based, simple for v1. |
| ORM / access | Drizzle ORM | Type-safe schema and migrations; works with SQLite and Fastify; supports future auth-ready columns (e.g. `user_id`). |
| Schema | `tasks` table (id, description, completed, createdAt; optional user_id) | Matches PRD; optional `user_id` keeps model auth-ready. |
| Migrations | Drizzle Kit | Generate and run migrations from schema; version-controlled SQL. |
| Caching | None in v1 | Simple CRUD; no caching layer required. |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Authentication | None in v1 | PRD: no login in v1; data model and API designed for future user–task relationship. |
| API security | CORS for frontend origin(s); security headers (e.g. content-type, X-Content-Type-Options) | SPA calls API from separate origin (dev and prod); no credentials in client for v1. |
| Transport | HTTPS in production | NFR-S1; TLS for data in transit. |
| Secrets | No long-lived secrets in client; env vars for backend config | NFR-S2; auth can be added later without insecure patterns. |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API style | REST over HTTP/JSON | PRD “well-defined API”; CRUD maps to GET/POST/PATCH/PUT/DELETE for tasks. |
| Validation | Zod + `fastify-type-provider-zod` | Request and response validation; shared types with frontend; good DX. |
| Error responses | JSON `{ code, message }` (or equivalent); HTTP 4xx/5xx | Consistent handling; frontend can show error state and retry (NFR-R2, UX). |
| API docs | Deferred | Optional; add OpenAPI when needed. |
| Cross-service | Frontend calls backend via HTTP; env-configured API base URL | Separate containers; same pattern for local (docker-compose) and prod (S3/CloudFront → EKS). |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Server state | TanStack Query (React Query) | Loading/error/retry and cache for list and mutations; aligns with “list visible immediately” and error recovery (PRD/UX). |
| Component structure | Per UX spec: TaskList, TaskCard, AddTaskRow, EmptyState, LoadingState, ErrorState | Single source of truth for layout and behavior. |
| Routing | Single view for MVP | No router required; one list screen with state-driven UI (loading/empty/error/list). |
| Styling | Tailwind CSS + design tokens (UX Direction C) | Utility-first; card-style list; WCAG 2.1 AA. |
| Build | Vite production build; static assets | Suitable for S3/CloudFront; no server-side rendering in v1. |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting (target) | Frontend: S3 + CloudFront; Backend: EKS | Confirmed in step 3; separate deployables. |
| Local dev | Docker Compose: `frontend` and `backend` services | Mirrors separation; frontend proxies or uses backend URL via env. |
| Env config | `.env` / env vars: `VITE_API_URL` (frontend), `PORT`, `DATABASE_URL` or path (backend) | Different values per environment; no secrets in repo. |
| CI/CD, monitoring, scaling | Deferred | Define in implementation when needed; v1 single instance acceptable. |

### Decision Impact Analysis

**Implementation sequence (high level):**

1. Repo and Docker: monorepo layout, `frontend/` and `backend/`, Dockerfiles + docker-compose.
2. Backend: Fastify + TypeScript, Drizzle + SQLite (schema + migrations), Zod validation, REST todo routes, error format.
3. Frontend: Vite + React + TS, Tailwind, TanStack Query, UX components (TaskList, TaskCard, AddTaskRow, states), wire to API.
4. E2E and unit tests: Playwright for journeys; Vitest for API and client logic.
5. Deployment prep: frontend build → static assets; backend container; env-based API URL.

**Cross-component dependencies:**

- **API contract** drives both backend route schemas (Zod) and frontend types (shared or generated); error shape affects frontend error/retry UI.
- **Drizzle schema** defines task (and optional user) model; migrations run before backend start.
- **TanStack Query** assumes REST endpoints and error format; backend must return consistent JSON and status codes.
- **Docker** frontend service needs backend URL (env) so SPA can call API in dev and prod.

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical conflict points addressed:** Naming (DB, API, code), project and file structure, API and data formats, error/loading process patterns — so all agents produce compatible code without rework.

### Naming Patterns

**Database naming (Drizzle + SQLite):**

- **Tables:** `snake_case`, plural (e.g. `tasks`). Auth-ready tables: `users` when added.
- **Columns:** `snake_case` (e.g. `id`, `description`, `completed`, `created_at`, `user_id`). Primary key `id`; foreign keys `{table_singular}_id` (e.g. `user_id`).
- **Indexes:** `idx_{table}_{column(s)}` (e.g. `idx_tasks_created_at`, `idx_tasks_user_id`).
- **Avoid:** PascalCase or camelCase table/column names; inconsistent plural/singular.

**API naming (REST):**

- **Resource paths:** Plural nouns, `snake_case` (e.g. `/todos` or `/api/todos`). Base path `/api` optional but consistent.
- **Route params:** `:id` for resource id (e.g. `GET /api/todos/:id`, `PATCH /api/todos/:id`, `DELETE /api/todos/:id`).
- **Query params:** `snake_case` when added (e.g. `completed`, `limit`). No camelCase in URLs.
- **HTTP methods:** GET (list, get one), POST (create), PATCH (partial update), PUT (replace if ever needed), DELETE (delete).

**Code naming (TypeScript / React):**

- **Components:** PascalCase (e.g. `TaskList`, `TaskCard`, `AddTaskRow`, `EmptyState`, `LoadingState`, `ErrorState`). Match UX spec names.
- **Files (components):** PascalCase for component files (e.g. `TaskList.tsx`, `TaskCard.tsx`) or index in folder (e.g. `TaskList/index.tsx`). One main component per file.
- **Hooks:** `camelCase`, prefix `use` (e.g. `useTodos`, `useTodoMutations`).
- **Functions / variables:** `camelCase`. API client functions: verb or resource (e.g. `fetchTodos`, `createTodo`, `updateTodo`, `deleteTodo`).
- **Types / interfaces:** PascalCase (e.g. `Todo`, `TodoCreate`, `ApiError`). Suffix DTOs with intent if helpful (e.g. `TodoResponse`).
- **Constants:** `UPPER_SNAKE_CASE` for true constants; `camelCase` for config objects.

### Structure Patterns

**Frontend (`frontend/` or `client/`):**

- **Layout:** `src/` with `main.tsx` (or `index.tsx`) as entry; `App.tsx` as root component.
- **Components:** `src/components/` — flat or grouped (e.g. `TaskList/`, `TaskCard/`) per UX component set. No deep “by-type” only structure; prefer feature/component grouping.
- **Hooks:** `src/hooks/` for shared hooks (e.g. `useTodos.ts`, `useTodoMutations.ts`).
- **API / services:** `src/api/` or `src/services/` for backend calls (e.g. `todos.ts` with `fetchTodos`, `createTodo`, etc.).
- **Types:** `src/types/` for shared TS types (e.g. `todo.ts` with `Todo`, `TodoCreate`). Align with API and Zod schemas where shared.
- **Tests:** Co-located `*.test.tsx` / `*.spec.tsx` next to source, or `__tests__/` beside the module. E2E: `e2e/` at frontend root (Playwright).
- **Config:** Root of frontend: `vite.config.ts`, `tsconfig.json`, `tailwind.config.*`, `.env.example` (e.g. `VITE_API_URL=`).

**Backend (`backend/` or `server/`):**

- **Layout:** `src/` with `app.ts` (or `index.ts`) as Fastify entry; plugins and routes registered there or via a plugin.
- **Routes:** `src/routes/` — one file per resource (e.g. `todos.ts` with list, get, create, update, delete handlers). Register under `/api/todos` or agreed base.
- **DB:** `src/db/` — `schema.ts` (Drizzle schema), `index.ts` (DB instance/plugin); migrations via Drizzle Kit in `drizzle/` or `src/db/migrations/`.
- **Validation:** Zod schemas in `src/schemas/` or next to routes (e.g. `todos.schema.ts`). Use with `fastify-type-provider-zod`.
- **Tests:** Co-located `*.test.ts` next to route/service or `tests/` at backend root. Integration tests call Fastify inject.
- **Config:** Root of backend: `tsconfig.json`, `drizzle.config.ts`, `.env.example` (e.g. `PORT=`, `DATABASE_URL=` or `DB_PATH=`).

**Repo root:**

- `docker-compose.yml`; `frontend/Dockerfile`, `backend/Dockerfile`. Optional `package.json` workspaces if monorepo tooling is used.
- `.gitignore` covers `node_modules/`, `.env`, `dist/`, `*.db`, etc.

### Format Patterns

**API response formats:**

- **Success (list):** Direct array. Example: `GET /api/todos` → `200` body `[{ "id": "...", "description": "...", "completed": false, "createdAt": "..." }, ...]`. No `{ data: [...] }` wrapper unless agreed for all endpoints.
- **Success (single):** Direct object. Example: `GET /api/todos/:id` → `200` body `{ "id": "...", "description": "...", "completed": false, "createdAt": "..." }`.
- **Success (create/update):** Return the created or updated resource as object; status `201` for create, `200` for update.
- **Error:** JSON body `{ "code": string, "message": string }`. `code` is a stable identifier (e.g. `NOT_FOUND`, `VALIDATION_ERROR`); `message` is human-readable. Use HTTP status (4xx/5xx) and body together. No extra wrapper (e.g. no `{ error: { ... } }`) unless adopted consistently.

**Data exchange (JSON):**

- **Field names:** `camelCase` in JSON (e.g. `createdAt`, `completed`). Backend converts to/from DB `snake_case` in Drizzle or in route layer so API stays camelCase.
- **Dates:** ISO 8601 strings (e.g. `"2026-03-17T12:00:00.000Z"`). No numeric timestamps in API contract.
- **Booleans:** `true` / `false`. No `1`/`0` in JSON.
- **Null:** Use `null` for absent optional fields; omit or null consistently per field.

### Communication Patterns

**Server state (TanStack Query):**

- **Query keys:** Array form, consistent (e.g. `['todos']` for list, `['todos', id]` for one). Use a small factory (e.g. `todoKeys.list()`, `todoKeys.detail(id)`) so keys stay consistent.
- **Mutations:** Invalidate or update relevant query keys after create/update/delete so list and detail stay in sync. Prefer invalidation for simplicity unless optimistic update is specified.
- **Naming:** `useTodos()` for list query; `useTodo(id)` for single; `useCreateTodo()`, `useUpdateTodo()`, `useDeleteTodo()` for mutations (or one `useTodoMutations()` that returns mutation functions).

**No custom event bus in v1.** State flows via TanStack Query and React props/context only.

### Process Patterns

**Error handling:**

- **Backend:** Validate with Zod; on validation failure return 400 with `{ code: "VALIDATION_ERROR", message: "..." }`. On not found return 404 with `{ code: "NOT_FOUND", message: "..." }`. On server error return 5xx and log; do not leak internals in `message`.
- **Frontend:** Use TanStack Query `isError`, `error`; map API error body to UI message. Show ErrorState with `message` and retry (e.g. refetch). No silent failures; always a path to retry or add task.

**Loading states:**

- **List:** TanStack Query `isLoading` (initial) and `isFetching` (refetch). Show LoadingState when loading list; avoid blank screen.
- **Mutations:** Optional local loading (e.g. disable submit or show spinner on button); list stays visible. No full-page loading for single mutation.
- **Naming:** Use `isLoading` / `isFetching` / `isPending` as per TanStack Query; component props can be `isLoading` or `loading` for presentational components.

### Enforcement Guidelines

**All agents MUST:**

- Use **snake_case** for DB tables and columns; **camelCase** for JSON and TypeScript (except constants).
- Use **plural** REST paths and **:id** for resource ids; **PascalCase** for React components and **camelCase** for functions/hooks/variables.
- Return **direct** success body (array or object) and **{ code, message }** for errors; **ISO 8601** for dates in API.
- Place **tests** co-located or in the agreed `tests`/`e2e` layout; **config** at app root; **routes** and **db** under `src/` in backend, **components** and **hooks** under `src/` in frontend.
- Follow **UX component names** (TaskList, TaskCard, AddTaskRow, EmptyState, LoadingState, ErrorState) and **Direction C** styling (card list, add at top).

**Pattern verification:** Code review and lint; optional shared ESLint/Prettier config. Document any exception in ADR or architecture doc and align with team.

### Pattern Examples

**Good:**

- Table `tasks` with columns `id`, `description`, `completed`, `created_at`; API `GET /api/todos` returns `[{ id, description, completed, createdAt }]`.
- Component `TaskCard.tsx` with props `todo` and `onComplete`, `onDelete`; uses Tailwind and card layout from Direction C.
- Hook `useTodos()` returns `{ data, isLoading, isError, error, refetch }`; `useCreateTodo()` invalidates `['todos']` on success.

**Avoid:**

- Mixing camelCase and snake_case in the same API or DB layer.
- Wrapping success in `{ data }` on some endpoints and not others.
- Different error shapes (e.g. `{ error: string }` vs `{ code, message }`).
- Skipping loading or error UI; leaving user on a blank or stuck screen.

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
aine-training/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.html
│   ├── public/
│   │   └── (static assets if any)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── AddTaskRow.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   └── ErrorState.tsx
│   │   ├── hooks/
│   │   │   ├── useTodos.ts
│   │   │   └── useTodoMutations.ts
│   │   ├── api/
│   │   │   └── todos.ts
│   │   └── types/
│   │       └── todo.ts
│   └── e2e/
│       └── (Playwright specs)
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts
│   ├── .env.example
│   ├── Dockerfile
│   ├── src/
│   │   ├── app.ts
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   ├── routes/
│   │   │   └── todos.ts
│   │   └── schemas/
│   │       └── todos.schema.ts
│   ├── drizzle/
│   │   └── (migrations)
│   └── tests/
│       └── (route/db tests)
└── _bmad-output/
    └── planning-artifacts/
        └── (PRD, UX, architecture docs)
```

Frontend tests may be co-located (e.g. `TaskList.test.tsx` beside `TaskList.tsx`) or in `src/__tests__/`; backend tests in `backend/tests/` or co-located. E2E in `frontend/e2e/` (Playwright).

### Architectural Boundaries

**API boundaries:**

- **External:** Frontend calls backend over HTTP. Base URL from `VITE_API_URL` (frontend env). No server-side rendering; all data via JSON API.
- **Endpoints:** `GET /api/todos` (list), `GET /api/todos/:id` (one), `POST /api/todos` (create), `PATCH /api/todos/:id` (update), `DELETE /api/todos/:id` (delete). All return JSON; errors use `{ code, message }`.
- **Internal (backend):** Routes in `src/routes/` call DB via Fastify-decorated `db` (Drizzle); validation via Zod in route layer or `src/schemas/`. No direct DB access outside `src/db/` and routes.

**Component boundaries:**

- **Frontend:** Single view; `App.tsx` renders `TaskList`, which composes `AddTaskRow`, `EmptyState`, `LoadingState`, `ErrorState`, and a list of `TaskCard`. Data from `useTodos()` and `useTodoMutations()`; API calls isolated in `src/api/todos.ts`. No global state beyond TanStack Query cache.
- **Backend:** Routes are the HTTP boundary; handlers use schemas for validation and `db` for persistence. No business logic in schema files; minimal logic in routes or a thin service layer if added later.

**Service boundaries:**

- **Frontend → Backend:** HTTP only; no shared code at runtime. Types can be shared via a shared package or duplicated in `frontend/src/types` and aligned with backend Zod/response shape.
- **Backend → Database:** Drizzle only; all access through `src/db/`. Migrations in `drizzle/`; schema in `src/db/schema.ts`.

**Data boundaries:**

- **Database:** SQLite file; single schema. Tables: `tasks` (and later `users` if auth added). Drizzle schema defines boundaries; no raw SQL outside migrations or explicit Drizzle raw if needed.
- **API payloads:** camelCase JSON; backend converts to/from DB snake_case in Drizzle or route layer. No caching layer in v1.

### Requirements to Structure Mapping

**FR categories → locations (no epics):**

| FR category | Frontend | Backend | Shared/notes |
|-------------|----------|---------|--------------|
| Task list display (FR1–4) | `TaskList`, `TaskCard`, `useTodos` | `GET /api/todos`, `db/schema` | Types in `frontend/src/types/todo.ts` |
| Task creation (FR5–7) | `AddTaskRow`, `useTodoMutations` (create) | `POST /api/todos`, `schemas/todos.schema` | |
| Task completion (FR8–9) | `TaskCard` (checkbox), mutations | `PATCH /api/todos/:id` | |
| Task deletion (FR10–11) | `TaskCard` (delete), mutations | `DELETE /api/todos/:id` | |
| Task editing (FR12–14) | `TaskCard` (inline edit), mutations | `PATCH /api/todos/:id` | |
| Persistence & data (FR15–18) | `api/todos.ts`, TanStack Query | `src/db/`, `src/routes/todos.ts` | |
| Empty, loading, error (FR19–23) | `EmptyState`, `LoadingState`, `ErrorState` in `TaskList` | 4xx/5xx + `{ code, message }` | |
| Accessibility & usability (FR24–26) | All components (markup, focus, labels) | N/A | |
| Cross-device (FR27–28) | Tailwind responsive, touch targets | N/A | |

**Cross-cutting:**

- **API contract:** Backend `src/routes/todos.ts` + `src/schemas/todos.schema.ts`; frontend `src/api/todos.ts` + `src/types/todo.ts`. Single source of truth for shape is backend; frontend types must match.
- **Error handling:** Backend returns consistent error body; frontend `ErrorState` and TanStack Query `error` handling in `TaskList` and mutation hooks.

### Integration Points

**Internal:**

- **Frontend:** `App` → `TaskList` → `AddTaskRow` / `TaskCard` / state components. Hooks `useTodos`, `useTodoMutations` used by `TaskList`; `api/todos.ts` called from hooks.
- **Backend:** `app.ts` registers DB plugin and routes; routes import schemas and use `fastify.db`.

**External:**

- **Frontend:** Only backend API (env `VITE_API_URL`). No other third-party services in v1.
- **Backend:** Only SQLite (file or path from env). No external APIs in v1.

**Data flow:**

- User action → React handler → mutation (TanStack Query) or refetch → `api/todos.ts` → HTTP → Fastify route → Zod validation → Drizzle → SQLite. Response → JSON → frontend → TanStack Query cache → re-render.

### File Organization Patterns

**Configuration:** Root: `docker-compose.yml`, `.env.example`, `.gitignore`. Frontend root: `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `.env.example`. Backend root: `tsconfig.json`, `drizzle.config.ts`, `.env.example`.

**Source:** Frontend: entry `main.tsx` → `App.tsx`; feature code under `src/components`, `src/hooks`, `src/api`, `src/types`. Backend: entry `app.ts`; feature code under `src/routes`, `src/db`, `src/schemas`.

**Tests:** Frontend: unit/component tests co-located (`*.test.tsx`) or in `src/__tests__/`; E2E in `frontend/e2e/`. Backend: `backend/tests/` or co-located `*.test.ts`.

**Assets:** Frontend static files in `frontend/public/`; built output in `frontend/dist/` (Vite). Backend has no static asset serving in v1.

### Development Workflow Integration

**Development:** From repo root, `docker-compose up` runs frontend and backend; or run `npm run dev` in `frontend/` and `backend/` separately with backend URL in frontend `.env`. Frontend dev server (Vite) and backend (tsx or compiled) hot-reload.

**Build:** Frontend: `npm run build` in `frontend/` → `frontend/dist/`. Backend: build TypeScript and run Node (or run with tsx in dev). Dockerfiles build each app in its container; docker-compose used for local full stack.

**Deployment:** Frontend: serve `dist/` from S3 + CloudFront. Backend: run Node in EKS from backend image. Env config per environment; no structural change.

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision compatibility:** Technology choices are consistent. Separate frontend (Vite + React + TypeScript) and backend (Fastify + TypeScript) align with Docker and future S3/CloudFront + EKS hosting. Drizzle + SQLite + Zod support type-safe persistence and API validation. TanStack Query supports loading, error, and retry behaviour required by the PRD and UX. No conflicting decisions identified.

**Pattern consistency:** Implementation patterns support the architecture. Naming (snake_case DB, camelCase JSON/code, PascalCase components) is consistent across the doc. Structure (frontend `src/components`, `hooks`, `api`, `types`; backend `routes`, `db`, `schemas`) matches the stack. Communication (REST, direct JSON, `{ code, message }` errors) and process (error/loading via TanStack Query and ErrorState/LoadingState) are coherent.

**Structure alignment:** The project tree supports all decisions. Frontend and backend boundaries are clear; API and data boundaries are defined. Integration points (env-based API URL, Drizzle-only DB access) are specified. The directory layout enables the chosen patterns without extra or missing layers.

### Requirements Coverage Validation ✅

**Functional requirements coverage:** All FR categories from the PRD are mapped to the architecture. Task list display, creation, completion, deletion, editing, persistence, empty/loading/error states, accessibility, and cross-device are assigned to specific components, routes, and DB layer in the Project Structure and Requirements-to-Structure Mapping sections. No FR category is without architectural support.

**Non-functional requirements coverage:** NFR-P (performance) is addressed by Vite build, efficient API, and optional optimistic UI. NFR-R (reliability) is addressed by persistent SQLite, error format, and retry/ErrorState. NFR-S (security) is addressed by HTTPS, no client secrets, and auth-ready model. NFR-A (accessibility) is addressed by WCAG 2.1 AA in decisions and component/styling patterns. NFR-V (verification) is addressed by Vitest, Playwright, and test placement in the structure.

### Implementation Readiness Validation ✅

**Decision completeness:** Critical decisions are documented with choices and rationale. Stack (Vite, Fastify, Drizzle, SQLite, Docker, TanStack Query, Zod, Tailwind) and versions are specified where relevant. Data, API, frontend, and infrastructure decisions are sufficient to start implementation.

**Structure completeness:** The project tree lists concrete directories and files (e.g. `TaskList.tsx`, `todos.ts` routes, `schema.ts`, `todos.schema.ts`). Entry points, config locations, and test locations are defined. Integration points and boundaries are described.

**Pattern completeness:** Naming, structure, format, communication, and process patterns are defined with examples and anti-patterns. Enforcement guidelines and “all agents MUST” rules are stated. Conflict points (DB vs API naming, error shape, loading/error UI) are covered.

### Gap Analysis Results

**Critical gaps:** None. No missing decisions, patterns, or structural elements that would block implementation.

**Important gaps (optional refinements):**

- **API base path:** Document could explicitly fix the base path (e.g. all routes under `/api`) so both sides use the same base; currently `/api/todos` is used in examples.
- **Shared types:** Frontend and backend types are described as “aligned” or duplicated; a shared `packages/types` or generated types from Zod could be added later for stricter contract consistency.

**Nice-to-have gaps:**

- CI/CD and deployment pipeline details (deferred).
- OpenAPI/Swagger generation from Zod (deferred).
- More E2E scenario examples (can be added during implementation).

### Validation Issues Addressed

No blocking issues were found. Optional refinements above can be adopted in a follow-up change or left for implementation stories.

### Architecture Completeness Checklist

**✅ Requirements analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural decisions**

- [x] Critical decisions documented with rationale
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance and NFR considerations addressed

**✅ Implementation patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication and format patterns specified
- [x] Process patterns (error, loading) documented

**✅ Project structure**

- [x] Complete directory structure defined
- [x] Component and API boundaries established
- [x] Integration points mapped
- [x] Requirements-to-structure mapping complete

### Architecture Readiness Assessment

**Overall status:** READY FOR IMPLEMENTATION

**Confidence level:** High — coherence, requirements coverage, and implementation readiness checks pass; no critical gaps.

**Key strengths:**

- Clear separation of frontend and backend with a single, well-defined API contract.
- Consistent patterns (naming, formats, error/loading) reduce agent and human implementation drift.
- UX and PRD are reflected in components, states, and NFRs.
- Auth-ready data model and deployment model (S3/CloudFront + EKS) are established without overbuilding v1.

**Areas for future enhancement:**

- Formal API base path and optional shared-types package.
- CI/CD and OpenAPI when needed.
- More E2E examples as features stabilize.

### Implementation Handoff

**AI agent guidelines:**

- Follow all architectural decisions exactly as documented in this file.
- Use implementation patterns consistently (naming, structure, formats, process).
- Respect project structure and boundaries (frontend/backend, routes, db, components).
- Refer to this document and the linked PRD/UX specs for architectural and product questions.

**First implementation priority:**

1. Create repo layout: `frontend/` and `backend/` with Dockerfiles and `docker-compose.yml`.
2. Initialize frontend: `npm create vite@latest frontend -- --template react-ts`; add Tailwind, Vitest, Playwright, Prettier.
3. Initialize backend: `npm init fastify backend`; add TypeScript, Drizzle + SQLite, Zod, Prettier, tests.
4. Implement backend: schema, migrations, `GET/POST/PATCH/DELETE /api/todos`, error format.
5. Implement frontend: `api/todos`, types, hooks (useTodos, useTodoMutations), TaskList, TaskCard, AddTaskRow, EmptyState, LoadingState, ErrorState; wire to API.
6. Add E2E for critical journeys (list load, add, complete, delete, error recovery).
