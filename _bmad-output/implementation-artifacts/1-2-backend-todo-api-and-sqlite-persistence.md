# Story 1.2: Backend todo API and SQLite persistence

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the app to store and retrieve tasks via an API,
so that my list can persist and support future features.

## Acceptance Criteria

1. **Given** the backend is running  
   **When** I send `GET /api/todos` (or agreed base path)  
   **Then** I receive 200 and a JSON array of tasks (empty array if none)  
   **And** Task shape: `id`, `description`, `completed`, `createdAt` (camelCase, ISO 8601 for date); `createdAt` is server-generated only (never accepted from client)  
   **And** Persistence uses Drizzle ORM + SQLite; table `tasks` with columns `id`, `description`, `completed`, `created_at`, and optional `user_id`; migrations via Drizzle Kit  
   **And** Request/response validated with Zod; errors return JSON `{ code, message }` with appropriate HTTP status; CORS allows frontend origin  
   **And** GET /api/todos and error responses are covered by backend unit or integration tests (NFR-V2)

## Tasks / Subtasks

- [x] **Task 1: Drizzle + SQLite setup** (AC: #1)
  - [x] Add dependencies: `drizzle-orm`, `drizzle-kit`, `better-sqlite3` (and `@types/better-sqlite3` if needed)
  - [x] Create `backend/src/db/schema.ts` with `tasks` table (id, description, completed, created_at, optional user_id); snake_case columns per architecture; `created_at` server-set on insert to current UTC (e.g. default or in application code), never from client
  - [x] Create `backend/src/db/index.ts` to instantiate Drizzle with better-sqlite3; use env `DB_PATH` or `DATABASE_URL` for file path
  - [x] Add `drizzle.config.ts` at backend root; use `driver: 'better-sqlite'` and path from env; enable `breakpoints: true` for migrations if generating multi-statement SQL
  - [x] Generate and run initial migration via Drizzle Kit; document `npm run db:generate` / `npm run db:migrate` (or equivalent) in README
- [x] **Task 2: Register DB and todo routes** (AC: #1)
  - [x] Register a Fastify plugin or decorator that attaches the Drizzle db instance (e.g. `fastify.decorate('db', db)`) so routes can use `fastify.db`
  - [x] Create `backend/src/routes/todos.ts` (or register under a plugin) for GET /api/todos
  - [x] Implement GET /api/todos: query all tasks, map to camelCase JSON (id, description, completed, createdAt as ISO 8601); return 200 with array (empty array if no tasks)
  - [x] Ensure CORS remains enabled for frontend origin (already in app.ts from story 1.1)
- [x] **Task 3: Zod validation and error contract** (AC: #1)
  - [x] Add `fastify-type-provider-zod` and `zod`; set validator/serializer compilers and use ZodTypeProvider for route schemas
  - [x] Define Zod response schema for task list (array of task object: id, description, completed, createdAt) and use in GET /api/todos response schema
  - [x] Ensure 404 and other errors return JSON `{ code, message }` with appropriate HTTP status (404 handler already exists from 1.1; extend for validation/server errors as needed)
- [x] **Task 4: Backend tests** (AC: #1)
  - [x] Add tests for GET /api/todos: 200 with empty array when no tasks; 200 with array of tasks when tasks exist; task shape (camelCase, ISO 8601 createdAt)
  - [x] Add tests for error responses (e.g. 404 or 5xx) returning `{ code, message }`
  - [x] Use Fastify inject or supertest for integration-style tests; place in `backend/tests/` or co-located

## Dev Notes

- **Epic 1 goal:** Runnable app and empty list experience. Story 1.2 delivers the backend API and persistence so the frontend (stories 1.3–1.5) can fetch and show loading/empty/error states.
- **Story 1.1 baseline:** Backend already has Fastify + TypeScript, CORS, `GET /api/health`, and 404 handler returning `{ code, message }`. Do not remove or break health route; add todos routes and DB alongside.
- **API base path:** Use `/api/todos` for the list endpoint (architecture: plural, snake_case in URL). Success: direct array; no `{ data: [...] }` wrapper.
- **Auth-ready:** Include optional `user_id` column in schema so the model supports future multi-user without schema change; v1 can leave it null.
- **createdAt:** Server-generated only. Set on insert to current UTC (Zulu) time; never accept `createdAt` from the client in any request body. Return it in GET (and future POST/PATCH responses) as read-only.

### Project Structure Notes

- **Backend (from architecture):** `src/db/schema.ts`, `src/db/index.ts`; `src/routes/todos.ts`; `src/schemas/todos.schema.ts` (Zod schemas). Migrations in `drizzle/` or `src/db/migrations/`.
- **Do not add** frontend API client, TanStack Query, or UI components in this story; backend only.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — Data Architecture (Drizzle + SQLite, tasks table, migrations), API & Communication Patterns (REST, Zod, error format), Format Patterns (camelCase JSON, ISO 8601), Structure Patterns (backend routes, db, schemas).
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 1, Story 1.2; Additional Requirements (API contract, data layer).
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffold-and-runnable-full-stack-app.md] — Existing backend layout and 404/health behavior.

---

## Developer Context

### Technical Requirements

- **Stack (this story):** Backend only. Fastify 5 + TypeScript, Drizzle ORM, SQLite (better-sqlite3), Zod, fastify-type-provider-zod. No frontend changes.
- **DB naming:** Tables and columns in snake_case: `tasks` table with `id`, `description`, `completed`, `created_at`, `user_id` (optional). Primary key `id`; indexes per architecture if needed (e.g. `idx_tasks_created_at`).
- **API naming:** Route `GET /api/todos`; response body camelCase: `id`, `description`, `completed`, `createdAt` (ISO 8601 string). Direct array for list. **createdAt is read-only:** always set by server on insert (current UTC); never accept it from the client in request bodies (POST/PATCH).
- **Error format:** JSON `{ code: string, message: string }` with HTTP 4xx/5xx. Already used in 404 handler; use same shape for validation or server errors (e.g. `VALIDATION_ERROR`, `INTERNAL_ERROR`).
- **Env:** Backend `.env.example` already has `PORT=`, optional `DB_PATH`/`DATABASE_URL`. Use one of these for SQLite file path in Drizzle config and db instance.

### Architecture Compliance

- **Data layer:** Drizzle ORM + SQLite only; all access through `src/db/`. Schema in `src/db/schema.ts`; migrations via Drizzle Kit; no raw SQL in routes except through Drizzle.
- **API contract:** REST; GET /api/todos returns 200 and a JSON array. No wrapper object. Errors: `{ code, message }` only.
- **Naming:** DB snake_case; JSON camelCase; conversion in route layer or via Drizzle column mapping so API stays camelCase.
- **CORS:** Keep existing CORS config from story 1.1 so frontend origin is allowed when frontend is added later.

### Library / Framework Requirements

- **Drizzle ORM:** Use `drizzle-orm`, `drizzle-kit`, `better-sqlite3`. Driver `'better-sqlite'` in drizzle.config. For migrations that generate multiple SQL statements, use `breakpoints: true` (drizzle.config or CLI) to avoid better-sqlite3 "more than one statement" errors.
- **fastify-type-provider-zod:** Use with Fastify 5: install `fastify-type-provider-zod` and `zod`. Register validator/serializer compilers from the package, then use `app.withTypeProvider<ZodTypeProvider>().route({ schema: { response: { 200: z.array(taskSchema) } }, ... })` for GET /api/todos so response is validated and typed.
- **Zod:** Define task schema (id, description, completed, createdAt) for response; use z.coerce or z.string() for dates to enforce ISO 8601 in serialization.

### File Structure Requirements

- **Must create:**  
  `backend/src/db/schema.ts`, `backend/src/db/index.ts`, `backend/src/routes/todos.ts`, `backend/src/schemas/todos.schema.ts` (or equivalent), `backend/drizzle.config.ts`, and at least one migration under `backend/drizzle/` (or configured migrations folder). Add npm scripts for db generate/migrate if not present.
- **Must not create:** Frontend `src/api/`, `useTodos`, or any React components. No POST/PATCH/DELETE routes yet (those are later stories).
- **Must preserve:** `backend/src/app.ts` health route and 404 handler; extend app with db plugin and todos routes only.

### Testing Requirements

- **Coverage (NFR-V2):** GET /api/todos and error responses must be covered by backend unit or integration tests.
- **Placement:** `backend/tests/` or co-located `*.test.ts` next to routes/db.
- **Approach:** Use Fastify `.inject()` for HTTP-level tests: call GET /api/todos, assert status 200 and body is array; assert task shape when fixtures exist; assert error responses have `code` and `message`. Optionally test with an in-memory or file-based SQLite DB for tests.

### Previous Story Intelligence

- **Story 1.1:** Backend is Fastify 5 + TypeScript, ESM (`"type": "module"`), tsx for dev. Entry is `src/app.ts`; no `src/db/` or `src/routes/` yet. 404 handler already returns `{ code: 'NOT_FOUND', message: 'Not Found' }`. CORS registered with `{ origin: true }`. Use same patterns: async route handlers, reply.status().send() for responses. Do not remove or rename `/api/health`.
- **File layout:** Backend has `src/app.ts`, `package.json`, `tsconfig.json`, `.env.example`, `Dockerfile`. Add db, routes, and schemas without changing existing file names or behavior of health/404.

### Latest Tech Information

- **fastify-type-provider-zod:** v6.x supports Fastify 5 and Zod; use `setValidatorCompiler` / `setSerializerCompiler` from the package, then `app.withTypeProvider<ZodTypeProvider>()` for routes with `schema.response` as Zod schemas.
- **Drizzle + better-sqlite3:** If migration files contain multiple statements, run with `breakpoints: true` in drizzle.config (or `--statement-breakpoint` in CLI) so Drizzle splits statements and better-sqlite3 accepts them. Use `drizzle-kit generate` and `drizzle-kit migrate` (or `push` for dev) per Drizzle docs.

### Project Context Reference

- No `project-context.md` in repo. Follow architecture and epics as source of truth. User skill level: intermediate (per config).

---

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent.)

### Debug Log References

### Completion Notes List

- Task 1: Drizzle + SQLite — Added drizzle-orm, drizzle-kit, better-sqlite3; schema.ts (tasks with id, description, completed, created_at, user_id); db/index.ts with getDbPath() from DB_PATH or DATABASE_URL; drizzle.config.ts with dialect sqlite, breakpoints: true; generated migration 0000_mean_iron_monger.sql; README updated with db:generate/db:migrate.
- Task 2: DB and routes — App decorates with `db` (fastify.decorate('db', db)); created routes/todos.ts with GET /api/todos returning camelCase array; CORS unchanged.
- Task 3: Zod and errors — Installed fastify-type-provider-zod and zod; set validator/serializer compilers; schemas/todos.schema.ts (taskListResponseSchema); GET /api/todos response schema; setErrorHandler for VALIDATION_ERROR/INTERNAL_ERROR returning { code, message }.
- Task 4: Tests — backend/tests/todos.test.ts with Node test runner and Fastify inject: GET /api/todos empty array, with tasks, task shape (camelCase, ISO 8601 createdAt), 404 { code, message }. Refactored app to buildApp() and only start() when not process.env.TEST for testability.

### File List

- backend/package.json (modified — deps, db:generate, db:migrate, test script)
- backend/drizzle.config.ts (new)
- backend/drizzle/0000_mean_iron_monger.sql (new)
- backend/src/db/schema.ts (new)
- backend/src/db/index.ts (new)
- backend/src/types/fastify.d.ts (new)
- backend/src/app.ts (modified — buildApp, Zod compilers, db decorator, error handler, TEST guard)
- backend/src/routes/todos.ts (new)
- backend/src/schemas/todos.schema.ts (new)
- backend/tests/todos.test.ts (new)
- backend/.env.example (unchanged; already had DB_PATH/DATABASE_URL comments)
- README.md (modified — backend scripts and db:migrate note)
- _bmad-output/implementation-artifacts/sprint-status.yaml (updated 1-2 to in-progress then review)
- _bmad-output/implementation-artifacts/1-2-backend-todo-api-and-sqlite-persistence.md (this file — tasks, status, file list, completion notes)

### Change Log

- 2026-03-17: Story 1.2 implemented — Drizzle + SQLite, GET /api/todos, Zod validation, error contract, backend tests.
