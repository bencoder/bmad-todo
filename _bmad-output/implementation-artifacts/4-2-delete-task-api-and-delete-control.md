# Story 4.2: Delete task API and delete control

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to delete a task in one or two actions without opening menus,
so that I can remove tasks quickly and clearly.

## Acceptance Criteria

1. **Given** a task is displayed in the list  
   **When** I activate the delete control (e.g. icon button with aria-label "Delete task")  
   **Then** the app sends DELETE to the API for that task and removes it from the list  
   **And** No multi-step menu or confirmation is required (or one lightweight confirm if product specifies)  
   **And** The control is visible or clearly reachable (not hover-only) and works with keyboard and touch  
   **And** DELETE and delete-control behavior are covered by backend tests and frontend integration or E2E tests  

## Tasks / Subtasks

- [x] **Task 1: DELETE route** (AC: #1)
  - [x] In `backend/src/routes/todos.ts`: add `DELETE /api/todos/:id` with route param `id` (same validation as PATCH: positive integer)
  - [x] Handler: validate id; find task by id; if not found return 404 with `{ code: 'NOT_FOUND', message: 'Task not found' }`; delete row from DB; return 204 No Content on success (no response body)
  - [x] Reuse existing `notFoundResponseSchema` for 404 response schema; DELETE success is 204 with no body (no schema needed)
- [x] **Task 2: Backend tests for DELETE** (AC: #1)
  - [x] In `backend/tests/todos.test.ts`: add test "DELETE /api/todos/:id returns 204 and removes task" (create task via POST, DELETE with that id, assert 204, GET list no longer includes task)
  - [x] Add test "DELETE /api/todos/:id returns 404 for non-existent id" (e.g. id 99999), assert 404, body has code 'NOT_FOUND'
  - [x] Add test for invalid id if applicable (e.g. id 0 or negative returns 400 or 404 per existing PATCH convention)
- [x] **Task 3: Frontend API and delete mutation** (AC: #1)
  - [x] In `frontend/src/api/todos.ts`: add `deleteTodo(id: number): Promise<void>` that sends DELETE to `/api/todos/${id}`, returns void on 204, throws on non-2xx with body.message or statusText
  - [x] In `frontend/src/hooks/`: add `useDeleteTodo()` using TanStack Query `useMutation`; on success invalidate `todosQueryKey` so list refetches; return `{ mutate, mutateAsync, isPending, isError, error }` as needed
- [x] **Task 4: Delete control on TaskCard and wire in TaskList** (AC: #1)
  - [x] TaskCard: add optional prop `onDelete?(id: number)`; add a delete control (button with aria-label "Delete task") after the task text/time; onClick calls `onDelete?.(todo.id)`; ensure control is visible (not hover-only) and has adequate touch target (min 44×44px per UX-DR10)
  - [x] Tab order: checkbox → text → delete (UX-DR3); delete control must be focusable and keyboard-activatable (Enter/Space)
  - [x] TaskList: get delete mutation from useDeleteTodo; pass to each TaskCard `onDelete` that calls mutation with todo.id; ensure list updates after delete (invalidate refetches list)
- [x] **Task 5: Frontend tests for delete** (AC: #1)
  - [x] Integration or E2E: click delete → DELETE called with correct id; list updates (refetch or optimistic). Test error path: mock DELETE to return 404 or 500 → error handled (e.g. list unchanged or inline message). Use Vitest + React Testing Library with mocked api/todos.deleteTodo or MSW; or Playwright E2E for full flow.

## Dev Notes

- **Epic 4 goal:** Complete and delete tasks (FR8–FR11). Story 4.1 delivered PATCH completion and checkbox toggle; this story delivers DELETE and delete control. No confirmation dialog required per AC unless product specifies; keep one-tap delete.
- **Existing backend:** GET, POST, PATCH only. No DELETE yet. Reuse same param validation as PATCH (`id: z.coerce.number().refine(...)`), `notFoundResponseSchema` for 404; use Drizzle `delete(tasks).where(eq(tasks.id, id))`; return `reply.status(204).send()` (no body).
- **Existing TaskCard:** Has checkbox and onToggleComplete; no delete control. Add delete button (icon or text "Delete") with aria-label "Delete task"; secondary/ghost styling per UX-DR11 (muted, not primary).

### Project Structure Notes

- **Backend:** `backend/src/routes/todos.ts` (add DELETE route, :id param, 204/404), `backend/tests/todos.test.ts` (DELETE tests). No new schema needed (DELETE has no body; 204 has no body).
- **Frontend:** `frontend/src/api/todos.ts` (add deleteTodo), `frontend/src/hooks/useDeleteTodo.ts` (new hook with useMutation, invalidate todosQueryKey), `frontend/src/components/TaskCard.tsx` (onDelete prop, delete button), `frontend/src/components/TaskList.tsx` (useDeleteTodo, pass onDelete to TaskCard).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — DELETE /api/todos/:id; 204 No Content or 200; 404 NOT_FOUND; TanStack Query invalidate ['todos']; useDeleteTodo naming; TaskCard onDelete.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 4, Story 4.2; AC: DELETE, no multi-step menu, control visible, keyboard/touch, tests.
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — UX-DR3: delete control with aria-label "Delete task"; Tab order checkbox → text/edit → delete; UX-DR10: 44×44px touch target; UX-DR11: secondary/ghost for delete.
- [Source: backend/src/routes/todos.ts] — PATCH :id param and notFoundResponseSchema pattern; replicate for DELETE.
- [Source: frontend/src/components/TaskCard.tsx] — Current structure (checkbox, span, time); add delete button after time.

---

## Developer Context

### Technical Requirements

- **DELETE contract:** `DELETE /api/todos/:id`. No request body. Success: 204 No Content (empty body). Not found: 404, body `{ code: 'NOT_FOUND', message: 'Task not found' }`. Invalid id (same as PATCH): 400 or 404 per team convention; 404 for non-existent id is required.
- **Frontend flow:** User activates delete control → call deleteTodo(todo.id) → on success: invalidate ['todos'], list refetches and task disappears (NFR-P3). Optional: optimistic update (remove from cache immediately, rollback on error).
- **Id param:** Same as PATCH: parse to number, positive integer; 404 for non-existent id.

### Architecture Compliance

- **Naming:** deleteTodo in api/todos.ts; useDeleteTodo in hooks; PascalCase components. Query key `todosQueryKey` from useTodos; mutation invalidates same key.
- **Format:** Success 204 = no body; error = `{ code, message }`. No camelCase in URL; :id only.
- **State:** TanStack Query only; mutation invalidates list query. TaskList uses useDeleteTodo(); passes onDelete to each TaskCard.

### Library / Framework Requirements

- **TanStack Query v5:** useMutation for delete; mutationFn: (id: number) => deleteTodo(id); onSuccess: queryClient.invalidateQueries({ queryKey: todosQueryKey }). isPending for optional disabled state on delete button during request.
- **React:** TaskCard receives todo and onDelete?(id); delete button: type="button", aria-label="Delete task", onClick={() => onDelete?.(todo.id)}. Parent (TaskList) provides callback that calls mutate(todo.id) or mutateAsync.
- **Fetch/API:** Same pattern as updateTodo: getTodosUrl() for base, DELETE to `${base}/api/todos/${id}`, no body; res.status === 204 for success; throw Error(message) on non-2xx.

### File Structure Requirements

- **Must modify (backend):** `backend/src/routes/todos.ts` — add DELETE route with :id, 204 response (no body schema), 404 notFoundResponseSchema; handler: lookup by id, 404 if not found, db.delete(tasks).where(eq(tasks.id, id)), return reply.status(204).send().
- **Must add (backend):** Tests in `backend/tests/todos.test.ts` for DELETE 204 (task removed), DELETE 404.
- **Must add/modify (frontend):** `frontend/src/api/todos.ts` — add `deleteTodo(id: number): Promise<void>` (DELETE, 204 = success, no body).  
  `frontend/src/hooks/useDeleteTodo.ts` — new hook with useMutation, invalidate todosQueryKey.
- **Must modify (frontend):** `frontend/src/components/TaskCard.tsx` — add optional `onDelete?(id: number)`; add delete button (after time) with aria-label "Delete task", min touch target 44×44px, secondary/ghost styling.  
  `frontend/src/components/TaskList.tsx` — use useDeleteTodo; pass onDelete to each TaskCard that calls mutation with todo.id.
- **Tests:** Backend: DELETE 204 and 404. Frontend: TaskCard with mocked onDelete; TaskList with mocked useDeleteTodo; delete triggers DELETE with correct id; list updates. E2E (optional): delete task, assert DELETE and item removed.

### Testing Requirements

- **Coverage (AC):** DELETE and delete-control behavior covered by backend tests and frontend integration or E2E tests (NFR-V1, NFR-V2). Backend: at least DELETE 204 (task removed from list), DELETE 404 for missing id. Frontend: at least delete control calls deleteTodo with correct id; list refetches or cache updates; task removed from UI.
- **Pattern:** Backend: buildApp(), create task via POST, inject DELETE, assert 204 and GET list no longer contains task; DELETE non-existent id assert 404. Frontend: mock deleteTodo or MSW DELETE; render TaskList with QueryClientProvider, trigger delete button, assert mutation called with id and query invalidated or list updated.

### Previous Story Intelligence

- **Story 4.1 (Complete task API and checkbox):** PATCH route with :id, notFoundResponseSchema, toApiTask; updateTodo and useUpdateTodo with invalidate todosQueryKey; TaskCard onToggleComplete and TaskList handleToggleComplete. Reuse exact same mutation pattern for useDeleteTodo (mutationFn(id), onSuccess invalidate todosQueryKey). TaskCard already has optional callback pattern; add onDelete the same way. Backend DELETE reuses param validation and 404 handling from PATCH; no new schema file changes needed (schemas/todos.schema.ts already has notFoundResponseSchema).
- **Story 3.2 / 3.1:** createTodo, useCreateTodo; api base getTodosUrl(), error parsing body.message. deleteTodo should follow same fetch/error pattern; no body for DELETE.
- **Story 2.1 / 2.2:** TaskCard layout (checkbox, span, time); add delete control after time without breaking list semantics (still one li per task). Tab order must remain checkbox → text → delete (UX-DR3).

### Latest Tech Information

- **TanStack Query v5:** useMutation for delete; no return value from deleteTodo; onSuccess invalidateQueries only. Optimistic update (optional): onMutate remove item from query data, onError rollback.
- **Fastify:** DELETE route with params schema same as PATCH; response 204: no schema (or empty); 404: notFoundResponseSchema. Drizzle: `await app.db.delete(tasks).where(eq(tasks.id, id))`; no .returning() for delete; check row existed first with select if 204 must only be when row was present (or delete and check affected rows if API supports it—Drizzle delete returns result; can check before delete with select).

### Project Context Reference

- No project-context.md in repo. Follow architecture and epics as source of truth. User skill level: intermediate (config).

---

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

### Completion Notes List

- DELETE route added in `backend/src/routes/todos.ts` with id param schema (same as PATCH), 204 on success, 404 with notFoundResponseSchema when task not found. Drizzle delete after select-for-existence check.
- Backend tests: DELETE 204 and removes task, DELETE 404 for non-existent id, DELETE 400 for invalid id (0).
- Frontend: `deleteTodo(id)` in api/todos.ts (DELETE, 204 = success); `useDeleteTodo` hook with useMutation and invalidate todosQueryKey.
- TaskCard: optional `onDelete` prop; delete button with aria-label "Delete task", min 44×44px touch target, secondary/ghost styling; tab order checkbox → text → delete.
- TaskList: useDeleteTodo, handleDelete calls mutate(todo.id), onDelete passed to each TaskCard; list refetches after delete via invalidation.
- Tests: api/todos.test.ts deleteTodo (204, 404, 500); TaskCard tests for delete button and onDelete(id); TaskList test for delete mutation with correct id; E2E delete task and assert DELETE 204 and item removed. Fixed pre-existing lint: removed unused isUpdating from TaskList.
- Backend tests could not be run in this environment due to better-sqlite3 Node version mismatch; implementation follows PATCH patterns and new tests were added.

### File List

- backend/src/routes/todos.ts (modified)
- backend/tests/todos.test.ts (modified)
- frontend/src/api/todos.ts (modified)
- frontend/src/hooks/useDeleteTodo.ts (new)
- frontend/src/components/TaskCard.tsx (modified)
- frontend/src/components/TaskList.tsx (modified)
- frontend/src/api/todos.test.ts (modified)
- frontend/src/components/TaskCard.test.tsx (modified)
- frontend/src/components/TaskList.test.tsx (modified)
- frontend/e2e/tasks.spec.ts (modified)

### Change Log

- 2026-03-18: Story 4.2 implemented. DELETE /api/todos/:id (204/404), deleteTodo API and useDeleteTodo, TaskCard delete control and TaskList wiring, backend and frontend tests including E2E delete flow.
