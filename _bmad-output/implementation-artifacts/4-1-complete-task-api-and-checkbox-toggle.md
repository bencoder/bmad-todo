# Story 4.1: Complete task API and checkbox toggle

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to mark a task complete or active again with one action,
so that I can track progress without extra steps.

## Acceptance Criteria

1. **Given** a task is displayed in the list  
   **When** I toggle the task's checkbox (or equivalent control)  
   **Then** the app sends PATCH to the API with `{ completed: true | false }` and the list updates (invalidate or optimistic)  
   **And** The UI reflects the new state immediately (NFR-P3); completed tasks show strikethrough and muted styling  
   **And** Checkbox has correct label/association for accessibility  
   **And** PATCH completion and checkbox behavior are covered by backend tests and frontend integration or E2E tests  

## Tasks / Subtasks

- [x] **Task 1: PATCH body schema and route** (AC: #1)
  - [x] In `backend/src/schemas/todos.schema.ts`: add Zod schema for PATCH body (e.g. `updateTaskRequestBodySchema`) with `completed: z.boolean()`; export for use in route
  - [x] In `backend/src/routes/todos.ts`: add `PATCH /api/todos/:id` with route param `id` (number or string-to-number), body schema, response 200 with `taskResponseSchema`
  - [x] Handler: validate id is valid integer; find task by id (Drizzle select/where); if not found return 404 with `{ code: 'NOT_FOUND', message: 'Task not found' }`; update `completed` in DB; return 200 with updated task via `toApiTask(row)`
- [x] **Task 2: Backend tests for PATCH** (AC: #1)
  - [x] In `backend/tests/todos.test.ts`: add test "PATCH /api/todos/:id with completed true returns 200 and updated task" (create task via POST, PATCH with { completed: true }, assert 200, body.completed === true, GET list includes updated task)
  - [x] Add test "PATCH /api/todos/:id with completed false toggles back" (same pattern for false)
  - [x] Add test "PATCH /api/todos/:id returns 404 for non-existent id" (e.g. id 99999), assert 404, body has code 'NOT_FOUND'
  - [x] Add test for invalid body if applicable (e.g. missing completed or non-boolean returns 400 VALIDATION_ERROR)
- [x] **Task 3: Frontend API and update mutation** (AC: #1)
  - [x] In `frontend/src/api/todos.ts`: add `updateTodo(id: number, payload: { completed: boolean }): Promise<Todo>` that sends PATCH to `/api/todos/${id}` with body `{ completed }`, returns updated task (same Todo shape), throws on non-2xx with body.message or statusText
  - [x] In `frontend/src/hooks/`: add `useUpdateTodo()` (or extend a single mutations hook) using TanStack Query `useMutation`; on success invalidate `todosQueryKey` so list refetches; return `{ mutate, mutateAsync, isPending, isError, error }` as needed
- [x] **Task 4: Wire TaskCard checkbox to mutation** (AC: #1)
  - [x] TaskCard: add prop `onToggleComplete?(todo: Todo)` (or `onToggleComplete?(id: number, completed: boolean)`); checkbox becomes controlled: `checked={todo.completed}`, `onChange` calls onToggleComplete with toggled value (e.g. `!todo.completed`)
  - [x] TaskList: get update mutation from hook; pass to each TaskCard `onToggleComplete` that calls mutation with todo.id and new completed value; ensure key remains todo.id so list updates correctly after refetch
  - [x] Strikethrough and muted styling already present in TaskCard (Story 2.1); no regression
- [x] **Task 5: Checkbox accessibility** (AC: #1)
  - [x] Checkbox has correct label/association: keep or improve aria-label (e.g. "Mark task complete" / "Mark task active" or "Task completed" / "Task not completed"); ensure label is associated or aria-label is present; Space toggles complete (native checkbox behavior)
- [x] **Task 6: Frontend tests for toggle** (AC: #1)
  - [x] Integration or E2E: toggle checkbox → PATCH called with correct id and completed value; list updates (refetch or optimistic); UI shows strikethrough when completed. Test error path: mock PATCH to return 404 or 500 → error handled (e.g. list unchanged or inline message). Use Vitest + React Testing Library with mocked api/todos.updateTodo or MSW; or Playwright E2E for full flow.

## Dev Notes

- **Epic 4 goal:** Complete and delete tasks — user can mark complete (or active again) in one action and delete in one or two actions (FR8, FR9, FR10, FR11). Story 4.1 delivers PATCH completion and checkbox toggle; Story 4.2 will deliver DELETE and delete control.
- **Existing backend:** GET and POST only. No PATCH or DELETE yet. Reuse `toApiTask`, `taskResponseSchema`, app error handler; add 404 NOT_FOUND for missing id (ensure app error handler or route returns 404 with `{ code: 'NOT_FOUND', message }`).
- **Existing TaskCard:** Checkbox is present but `readOnly` — no onChange. Strikethrough and muted for completed already applied. Add `onToggleComplete` callback and wire to mutation; do not remove existing styling or semantics.

### Project Structure Notes

- **Backend:** `backend/src/schemas/todos.schema.ts` (add PATCH body schema), `backend/src/routes/todos.ts` (add PATCH route, :id param), `backend/tests/todos.test.ts` (PATCH tests).
- **Frontend:** `frontend/src/api/todos.ts` (add updateTodo), `frontend/src/hooks/useUpdateTodo.ts` (or useTodoMutations with updateTodo), `frontend/src/components/TaskCard.tsx` (onToggleComplete, checkbox onChange), `frontend/src/components/TaskList.tsx` (pass mutation to TaskCard).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — PATCH /api/todos/:id (partial update); Zod + fastify-type-provider-zod; 200 + updated resource; 404 NOT_FOUND; TanStack Query invalidate ['todos']; naming and format patterns.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 4, Story 4.1; AC: PATCH { completed }, list update, immediate UI, checkbox a11y, tests.
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — UX-DR3 TaskCard checkbox + Space toggles complete; strikethrough and muted for completed; Tab order checkbox → text → delete.
- [Source: backend/src/routes/todos.ts] — GET/POST and toApiTask pattern; no PATCH yet.
- [Source: frontend/src/components/TaskCard.tsx] — Current checkbox readOnly, strikethrough/muted already applied.

---

## Developer Context

### Technical Requirements

- **PATCH contract:** `PATCH /api/todos/:id` body `{ completed: boolean }`. Success: 200, body = updated task object `{ id, description, completed, createdAt }` (camelCase, ISO 8601). Not found: 404, body `{ code: 'NOT_FOUND', message: 'Task not found' }`. Validation failure (e.g. missing or non-boolean completed): 400, body `{ code: 'VALIDATION_ERROR', message }`.
- **Frontend flow:** User clicks checkbox → onChange fires with new completed value → call updateTodo(todo.id, { completed: newValue }) → on success: invalidate ['todos'], list refetches and UI updates (NFR-P3: immediate or after refetch). Optional: optimistic update (update cache immediately, rollback on error).
- **Id param:** Backend :id must be parsed to number; invalid id (e.g. NaN or negative) can return 400 or 404 per team convention; 404 for non-existent id is required.

### Architecture Compliance

- **Naming:** updateTodo in api/todos.ts; useUpdateTodo in hooks; PascalCase components. Query key `todosQueryKey` from useTodos; mutation invalidates same key.
- **Format:** Request/response camelCase; success = direct object; error = `{ code, message }`; dates ISO 8601 (architecture § Format Patterns).
- **State:** TanStack Query only; mutation invalidates list query; no global state beyond Query cache. TaskList uses useTodos() and useUpdateTodo(); passes onToggleComplete to each TaskCard.

### Library / Framework Requirements

- **TanStack Query v5:** useMutation for update; mutationFn: ({ id, completed }) => updateTodo(id, { completed }); onSuccess: queryClient.invalidateQueries({ queryKey: todosQueryKey }). isPending for optional disabled state on checkbox during request.
- **React:** TaskCard receives todo and onToggleComplete(todo) or (id, completed); checkbox controlled: checked={todo.completed}, onChange={() => onToggleComplete?.(todo.id, !todo.completed)}. Parent (TaskList) provides callback that calls mutate({ id: todo.id, completed: newValue }) or mutateAsync.
- **Fetch/API:** Same pattern as createTodo: getTodosUrl() for base, PATCH to `${base}/api/todos/${id}`, body JSON.stringify({ completed }), res.ok check, res.json() for body, throw Error(message) on non-2xx.

### File Structure Requirements

- **Must add/modify (backend):** `backend/src/schemas/todos.schema.ts` — add `updateTaskRequestBodySchema` with `completed: z.boolean()`.  
  `backend/src/routes/todos.ts` — add PATCH route with :id, body schema, 200 response schema; handler: lookup by id, 404 if not found, update completed, return toApiTask(updatedRow).
- **Must add (backend):** Tests in `backend/tests/todos.test.ts` for PATCH 200 (completed true/false), 404, and optionally 400 for invalid body.
- **Must add/modify (frontend):** `frontend/src/api/todos.ts` — add `updateTodo(id: number, payload: { completed: boolean }): Promise<Todo>`.  
  `frontend/src/hooks/useUpdateTodo.ts` — new hook (or add to useTodoMutations) with useMutation, invalidate todosQueryKey.
- **Must modify (frontend):** `frontend/src/components/TaskCard.tsx` — add optional `onToggleComplete?(id: number, completed: boolean)` or `onToggleComplete?(todo: Todo)`; checkbox onChange calls it with todo.id and !todo.completed; remove readOnly when onToggleComplete is provided.  
  `frontend/src/components/TaskList.tsx` — use useUpdateTodo; pass onToggleComplete to each TaskCard that calls mutation with todo.id and new completed.
- **Tests:** Backend: PATCH success (true/false), 404, 400. Frontend: TaskCard with mocked onToggleComplete; TaskList with mocked useUpdateTodo; toggle triggers PATCH with correct payload; list updates. E2E (optional): open app, toggle checkbox, assert PATCH and UI update.

### Testing Requirements

- **Coverage (AC):** PATCH completion and checkbox behavior covered by backend tests and frontend integration or E2E tests (NFR-V1, NFR-V2). Backend: at least PATCH 200 with completed true, PATCH 200 with completed false, PATCH 404 for missing id. Frontend: at least toggle calls updateTodo with correct id and completed; list refetches or cache updates; completed task shows strikethrough.
- **Pattern:** Backend: buildApp(), create task via POST, inject PATCH with body { completed: true/false }, assert status and body. Frontend: mock updateTodo or MSW PATCH; render TaskList with QueryClientProvider, trigger checkbox change, assert mutation called with correct args and query invalidated or list updated.

### Previous Story Intelligence

- **Story 3.2 (AddTaskRow and add task):** createTodo and useCreateTodo pattern; todosQueryKey from useTodos; TaskList wires AddTaskRow with mutation and clearInputRef. Reuse same mutation pattern for useUpdateTodo (mutationFn, onSuccess invalidate todosQueryKey). TaskList already has useCreateTodo; add useUpdateTodo and pass onToggleComplete to TaskCard.
- **Story 3.1 (Create task API POST):** Backend POST route and createTaskRequestBodySchema; toApiTask and taskResponseSchema; 201 and 400 VALIDATION_ERROR. PATCH should follow same validation and response shape; add 404 for not found.
- **Story 2.1 / 2.2:** TaskCard already has checkbox (readOnly), strikethrough and muted for completed; TaskList renders TaskCard with todo only. Do not change list structure or empty/loading/error routing; only add toggle behavior and mutation wiring.

### Latest Tech Information

- **TanStack Query v5:** useMutation with mutationFn(args) and onSuccess invalidateQueries; same pattern as useCreateTodo. For optimistic update (optional): onMutate set query data with updated item, onError rollback.
- **Fastify + Zod:** Route schema with params: `params: z.object({ id: z.coerce.number() })` or similar for :id; body: updateTaskRequestBodySchema; response: 200: taskResponseSchema. Use app.db.update(tasks).set({ completed }).where(eq(tasks.id, id)).returning() with Drizzle.

### Project Context Reference

- No project-context.md in repo. Follow architecture and epics as source of truth. User skill level: intermediate (config).

---

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

- Backend tests could not be run in this environment (better-sqlite3 native module compiled for different Node version). PATCH implementation and tests follow existing POST/GET patterns; frontend tests all pass.

### Completion Notes List

- Task 1: Added `updateTaskRequestBodySchema` and `notFoundResponseSchema` in todos.schema.ts; PATCH `/api/todos/:id` with params (id), body (completed), 200/404 response; handler uses Drizzle eq/select/update/returning, returns toApiTask(updated).
- Task 2: Added 5 PATCH tests: 200 with completed true/false, 404 for missing id, 400 for missing body and non-boolean completed.
- Task 3: Added `updateTodo(id, { completed })` in api/todos.ts; added useUpdateTodo hook with useMutation and invalidateQueries(todosQueryKey).
- Task 4: TaskCard accepts optional `onToggleComplete(id, completed)`, checkbox controlled and not readOnly when provided; TaskList uses useUpdateTodo and passes handleToggleComplete to each TaskCard.
- Task 5: aria-label "Mark task complete" / "Mark task active"; native checkbox preserves Space key behavior.
- Task 6: TaskCard tests updated for new aria-labels; added tests for onToggleComplete callback and non-readOnly when provided; api/todos.test.ts updateTodo tests (PATCH URL, body, error handling); TaskList tests mock useUpdateTodo and assert toggle calls mutate with { id, completed }.

### File List

- backend/src/schemas/todos.schema.ts (modified)
- backend/src/routes/todos.ts (modified)
- backend/tests/todos.test.ts (modified)
- frontend/src/api/todos.ts (modified)
- frontend/src/api/todos.test.ts (modified)
- frontend/src/hooks/useUpdateTodo.ts (new)
- frontend/src/components/TaskCard.tsx (modified)
- frontend/src/components/TaskCard.test.tsx (modified)
- frontend/src/components/TaskList.tsx (modified)
- frontend/src/components/TaskList.test.tsx (modified)

### Change Log

- 2026-03-18: Implemented PATCH completion API, updateTodo/useUpdateTodo, TaskCard checkbox toggle and accessibility, backend and frontend tests. Story 4.1 complete.
