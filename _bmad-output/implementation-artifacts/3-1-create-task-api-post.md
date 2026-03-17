# Story 3.1: Create task API (POST)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to create a new task via the API,
so that I can add tasks from the UI and have them persisted.

## Acceptance Criteria

1. **Given** the backend is running  
   **When** I send `POST /api/todos` with body `{ "description": "string" }`  
   **Then** the request is validated with Zod (non-empty description or per product rule)  
   **And** On success I receive 201 and the created task object (id, description, completed, createdAt), and the task is stored in SQLite  
   **And** On validation failure I receive 400 with `{ code, message }`  
   **And** POST success and validation failure are covered by backend unit or integration tests  

## Tasks / Subtasks

- [x] **Task 1: Request body schema and validation** (AC: #1)
  - [x] In `backend/src/schemas/todos.schema.ts`: add Zod schema for POST body (e.g. `createTaskRequestBodySchema`) with `description` as non-empty string (e.g. `z.string().min(1)` or trim + min(1) per product rule); export it for use in route
  - [x] Align with existing `taskResponseSchema` and `taskListResponseSchema`; response shape for created task is same as one task (id, description, completed, createdAt, camelCase, ISO 8601 for createdAt)
- [x] **Task 2: POST /api/todos route** (AC: #1)
  - [x] In `backend/src/routes/todos.ts`: add `app.post('/api/todos', { schema: { body: createTaskRequestBodySchema, response: { 201: taskResponseSchema } } }, async (request, reply) => { ... })`
  - [x] Parse body; insert into `tasks` via Drizzle (description, completed default false, created_at default); return 201 with created task object using same `toApiTask()` pattern as GET (camelCase, ISO 8601 createdAt)
  - [x] Use existing `app.db`, `tasks` from schema; if Drizzle supports `.returning()` for SQLite use it to get the inserted row, otherwise insert then select the row by id to return
- [x] **Task 3: Validation failure returns 400** (AC: #1)
  - [x] Ensure empty string or missing `description` is rejected by Zod; existing app error handler maps FST_ERR_VALIDATION to 400 and `{ code: 'VALIDATION_ERROR', message }` — no route change needed if body schema is attached
  - [x] Optionally add a test that sends invalid body (e.g. `{}` or `{ description: '' }`) and asserts 400, `code: 'VALIDATION_ERROR'`, and task not in DB
- [x] **Task 4: Backend tests for POST** (AC: #1)
  - [x] In `backend/tests/todos.test.ts`: add test "POST /api/todos returns 201 and created task with valid description"
  - [x] Build app, inject POST with body `{ description: 'New task' }`, assert status 201, body has id, description 'New task', completed false, createdAt ISO 8601; optionally assert GET /api/todos includes the new task
  - [x] Add test "POST /api/todos returns 400 for invalid body" (e.g. missing description, or empty string): assert status 400, body has code 'VALIDATION_ERROR', message present; assert no task created in DB

## Dev Notes

- **Epic 3 goal:** Add tasks — user can add a new task with a short description in one or two actions and see the new task appear in the list immediately (FR5, FR6, FR7). Story 3.1 is backend-only; Story 3.2 wires AddTaskRow to POST and handles optimistic/refetch.
- **Scope:** Only backend: Zod body schema, POST route, persistence, tests. No frontend or API client changes in this story.
- **Existing patterns:** GET /api/todos already uses `taskListResponseSchema` and `toApiTask(row)`; error handler in app.ts maps validation to 400 and `{ code, message }`. Reuse same response shape and error contract.

### Project Structure Notes

- **Backend:** Routes in `backend/src/routes/todos.ts`, schemas in `backend/src/schemas/todos.schema.ts`, DB `backend/src/db/schema.ts` (`tasks` table). Tests in `backend/tests/todos.test.ts` using `buildApp()`, `app.inject()`, in-memory DB, migrate before tests.
- **API contract:** REST JSON; success = direct object (no `data` wrapper); error = `{ code, message }`; camelCase in JSON; ISO 8601 dates (architecture § Format Patterns, § API & Communication Patterns).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — POST /api/todos (create); Zod + fastify-type-provider-zod; 201 + created resource; 400 for validation; Drizzle + SQLite; naming and structure.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 3, Story 3.1; AC: POST body validation, 201 + task, 400 on failure, tests.
- [Source: backend/src/routes/todos.ts] — GET route and toApiTask pattern.
- [Source: backend/src/schemas/todos.schema.ts] — taskResponseSchema, taskListResponseSchema.
- [Source: backend/src/app.ts] — validator/serializer compilers, error handler (VALIDATION_ERROR → 400).

---

## Developer Context

### Technical Requirements

- **Stack:** Backend only. Fastify, TypeScript, Drizzle ORM (better-sqlite3), Zod, fastify-type-provider-zod. Reuse existing `tasks` table, `toApiTask`, `taskResponseSchema`, app error handler.
- **POST contract:** Body `{ description: string }`; validate with Zod (non-empty after trim, or per product rule). Success: 201, body = created task object `{ id, description, completed, createdAt }` (camelCase, ISO 8601). Validation failure: 400, body `{ code: 'VALIDATION_ERROR', message: string }`. Existing setErrorHandler already sends this for FST_ERR_VALIDATION.
- **Persistence:** Insert into `tasks` (description, completed default false, created_at default). Return the created row using toApiTask(); use `.returning()` on insert if Drizzle SQLite supports it, else insert then select by id.
- **No frontend changes.** No changes to frontend api/todos.ts or useTodos in this story.

### Architecture Compliance

- **Naming:** DB columns stay snake_case; JSON and route layer use camelCase. REST path `/api/todos`, plural. Zod schema in `src/schemas/todos.schema.ts`; route in `src/routes/todos.ts`.
- **Format:** Success response = direct object (no wrapper). Error = `{ code, message }`. Dates ISO 8601 (architecture § Format Patterns).
- **Validation:** Zod + fastify-type-provider-zod; body schema attached to route so invalid body triggers validation error and app error handler returns 400.

### Library / Framework Requirements

- **Zod (v4):** Use `z.object({ description: z.string().min(1) })` or `.trim().min(1)` for non-empty description. Export schema for route.
- **Fastify + fastify-type-provider-zod:** Route schema: `body: createTaskRequestBodySchema`, `response: { 201: taskResponseSchema }`. App already has setValidatorCompiler/setSerializerCompiler.
- **Drizzle ORM:** `app.db.insert(tasks).values({ description })`; default completed and created_at from schema. Check Drizzle SQLite docs for `.returning()` to get inserted row in one step; otherwise insert then select.

### File Structure Requirements

- **Must modify:** `backend/src/schemas/todos.schema.ts` — add createTaskRequestBodySchema (description non-empty string).
- **Must modify:** `backend/src/routes/todos.ts` — add POST /api/todos handler; reuse toApiTask; return 201 with created task.
- **Must modify:** `backend/tests/todos.test.ts` — add at least two tests: POST 201 with valid body returns task; POST 400 for invalid body (empty/missing description) returns VALIDATION_ERROR and no task in DB.
- **Must not change:** Frontend; GET /api/todos; app.ts error handler (already correct); db/schema.ts (tasks table already has required columns).

### Testing Requirements

- **Coverage (AC):** POST success and validation failure must be covered by backend unit or integration tests.
- **Pattern:** Same as existing tests: `const app = await buildApp()`, `app.inject({ method: 'POST', url: '/api/todos', payload: { description: '...' } })`, assert statusCode and body. Use in-memory DB; migrate already run; clear or isolate data per test if needed.
- **Tests to add:** (1) POST with valid description → 201, body has id, description, completed: false, createdAt ISO 8601; (2) POST with invalid body (e.g. `{}`, `{ description: '' }`) → 400, body.code === 'VALIDATION_ERROR', and no new task in DB (e.g. GET /api/todos count unchanged or DB empty).

### Previous Story Intelligence

- **Story 2.2 (TaskList, AddTaskRow):** Frontend-only; AddTaskRow is presentational in 2.2; POST is wired in Epic 3 Story 3.2. This story (3.1) only adds the backend POST endpoint so 3.2 can call it.
- **Story 1.2 (Backend todo API):** Established GET /api/todos, Drizzle schema, Zod response schema, error format, and test pattern (buildApp, inject, assert status and body). Reuse same route file, schema file, and test file; add POST alongside GET and add tests alongside existing GET tests.

### Latest Tech Information

- **fastify-type-provider-zod:** With validatorCompiler, invalid body is rejected before handler runs and error handler returns 400 with code 'VALIDATION_ERROR'. No need to manually validate in handler.
- **Drizzle SQLite:** Insert returns run result; use `.returning()` if available to get inserted row, else use insert then select by last insert id or by querying the single row you inserted (e.g. by description and recent createdAt) for test stability.

### Project Context Reference

- No `project-context.md` in repo. Follow architecture and epics as source of truth. User skill level: intermediate (per config).

---

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

### Completion Notes List

- Task 1: Added `createTaskRequestBodySchema` in `backend/src/schemas/todos.schema.ts` with `description: z.string().trim().min(1)`; exported for route use. Response shape aligned with `taskResponseSchema` (camelCase, ISO 8601).
- Task 2: Added POST `/api/todos` in `backend/src/routes/todos.ts` with body/response schema; insert via Drizzle `.values({ description }).returning()`, return 201 with `toApiTask(row)`.
- Task 3: Zod rejects empty/missing description; added `setSchemaErrorFormatter` in `app.ts` so validation errors return `{ code: 'VALIDATION_ERROR', message }` (Fastify 5 sends validation error before setErrorHandler; formatter ensures correct code). Added tests for missing body and empty description.
- Task 4: Added tests: "POST /api/todos returns 201 and created task with valid description", "POST /api/todos returns 400 for invalid body", "POST /api/todos returns 400 for empty description". All 8 backend tests pass (run with Node 24: `nvm use 24 && npm test`).

### File List

- backend/src/schemas/todos.schema.ts (modified)
- backend/src/routes/todos.ts (modified)
- backend/src/app.ts (modified)
- backend/tests/todos.test.ts (modified)

### Change Log

- 2026-03-17: Story 3.1 implemented — POST /api/todos with Zod body schema, Drizzle insert with .returning(), 201 + task response, 400 on validation (setSchemaErrorFormatter for VALIDATION_ERROR), backend tests for 201 and 400.
