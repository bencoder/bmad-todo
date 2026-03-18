# Story 5.1: Edit task API and inline edit in TaskCard

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to change a task's description in place with one or two actions,
so that I can fix or update text without leaving the list.

## Acceptance Criteria

1. **Given** a task is displayed in the list  
   **When** I activate edit (e.g. click the task label or an edit control)  
   **Then** the label becomes an inline input (or single-step edit flow); I can change the text and save (blur or Enter) or cancel (Escape)  
   **And** On save, the app sends PATCH with `{ description }` and the list updates; only one task is in edit mode at a time  
   **And** The updated task is visible in the list after save (FR14); validation (e.g. non-empty) and inline error follow UX-DR12  
   **And** PATCH description and inline-edit behavior are covered by backend tests and frontend integration or E2E tests  

## Tasks / Subtasks

- [x] **Task 1: Extend PATCH body and route for description** (AC: #1)
  - [x] In `backend/src/schemas/todos.schema.ts`: extend `updateTaskRequestBodySchema` to allow optional `description` (e.g. `z.string().trim().min(1).optional()`) in addition to existing `completed`; require at least one of `completed` or `description` (e.g. `.refine(...)`) so PATCH can update either or both
  - [x] In `backend/src/routes/todos.ts`: PATCH handler reads both `completed` and `description` from body; build update object with only present fields; if `description` provided use it in `set()`, if `completed` provided use it; run single `update().set(updates).where(eq(tasks.id, id)).returning()`; return 200 with updated task; if body has neither field (validation should prevent) return 400
- [x] **Task 2: Backend tests for PATCH description** (AC: #1)
  - [x] In `backend/tests/todos.test.ts`: add test "PATCH /api/todos/:id with description returns 200 and updated task" (create task via POST, PATCH with `{ description: "new text" }`, assert 200, body.description === "new text", GET list includes updated description)
  - [x] Add test "PATCH /api/todos/:id with description and completed updates both" (optional, if both sent)
  - [x] Add test "PATCH /api/todos/:id with empty or whitespace-only description returns 400" (validation error)
  - [x] Ensure existing PATCH tests (completed only) still pass (no regression)
- [x] **Task 3: Frontend API and useUpdateTodo for description** (AC: #1)
  - [x] In `frontend/src/api/todos.ts`: extend `updateTodo(id, payload)` to accept `payload: { completed?: boolean; description?: string }`; send only present fields in PATCH body (e.g. if only description: `{ description }`, if both: `{ completed, description }`); return updated Todo; keep existing error handling
  - [x] In `frontend/src/hooks/useUpdateTodo.ts`: extend mutation to pass `{ id, completed?, description? }` to `updateTodo(id, { completed, description })` (only include defined fields in the object passed to updateTodo)
- [x] **Task 4: Inline edit in TaskCard** (AC: #1)
  - [x] TaskCard: add props `isEditing?: boolean`, `onStartEdit?: (id: number) => void`, `onSaveEdit?: (id: number, description: string) => void`, `onCancelEdit?: (id: number) => void`. When not editing: show task text in a focusable span (or button) that calls `onStartEdit(todo.id)` on click; preserve tab order checkbox → text/edit → delete (UX-DR3). When editing: replace label with an input pre-filled with current description; save on blur or Enter (trim, validate non-empty per UX-DR12); cancel on Escape (call onCancelEdit). Input should match add-input styling where appropriate; ensure one active edit at a time is enforced by parent (TaskList)
  - [x] Accessibility: edit trigger has clear affordance (click label or optional edit icon with aria-label "Edit task"); inline input has label/aria-label; Enter saves, Escape cancels; focus management: when entering edit focus input, when saving/cancelling move focus sensibly (e.g. back to label or next focusable)
- [x] **Task 5: TaskList: editing state and handlers** (AC: #1)
  - [x] TaskList: add state `editingId: number | null`; pass to each TaskCard `isEditing={editingId === todo.id}`, `onStartEdit={(id) => setEditingId(id)}`, `onSaveEdit={(id, desc) => { trim desc; if empty show inline error or revert; else call updateTodo with { id, description: desc }, on success setEditingId(null) and list refetches via invalidation }`, `onCancelEdit={() => setEditingId(null)}`. Ensure only one task can be in edit mode (editingId single value). Use existing useUpdateTodo; when saving description call `updateTodo({ id, description: trimmedDescription })` (extend mutate to accept description)
- [x] **Task 6: Validation and inline error** (AC: #1)
  - [x] If user saves with empty or whitespace-only description: show inline error near the edit field or revert and keep edit mode (per UX-DR12); backend already returns 400 for invalid description — frontend should display that message or "Description required" and not close edit mode until valid
- [x] **Task 7: Frontend and E2E tests for edit** (AC: #1)
  - [x] Unit/integration: TaskCard in edit mode renders input; save (blur/Enter) calls onSaveEdit with correct id and trimmed text; Escape calls onCancelEdit; TaskList only one editingId at a time. Mock updateTodo; assert PATCH called with correct id and description.
  - [x] E2E (e.g. Playwright): activate edit on a task → type new text → save (Enter or blur) → assert PATCH request with new description and list shows updated text; cancel (Escape) → list unchanged; empty save shows error or no request. Cover edit flow in `frontend/e2e/tasks.spec.ts` or equivalent.

## Dev Notes

- **Epic 5 goal:** Edit tasks — user can change task description in one or two actions and see the update in the list (FR12, FR13, FR14). This story delivers PATCH description and inline edit in TaskCard.
- **Existing backend:** PATCH /api/todos/:id currently accepts only `{ completed: boolean }` and updates only `completed`. Extend schema and handler to accept optional `description` and update it; keep backward compatibility for completion-only updates.
- **Existing TaskCard:** Shows checkbox, span (description), time, delete button. No edit mode yet. Add inline edit: click label → input; save blur/Enter, cancel Escape; only one card in edit mode (parent holds editingId).
- **Existing frontend API:** `updateTodo(id, { completed })` — extend to `updateTodo(id, { completed?, description? })` and send only provided fields. useUpdateTodo currently mutates with `{ id, completed }` — extend to `{ id, completed?, description? }`.

### Project Structure Notes

- **Backend:** `backend/src/schemas/todos.schema.ts` (extend updateTaskRequestBodySchema), `backend/src/routes/todos.ts` (PATCH handler builds partial updates), `backend/tests/todos.test.ts` (PATCH description tests).
- **Frontend:** `frontend/src/api/todos.ts` (extend updateTodo payload), `frontend/src/hooks/useUpdateTodo.ts` (accept description in mutate), `frontend/src/components/TaskCard.tsx` (inline edit UI and callbacks), `frontend/src/components/TaskList.tsx` (editingId state and handlers).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — PATCH partial update; 200 + updated resource; 404 NOT_FOUND; TanStack Query invalidate; naming updateTodo, useUpdateTodo.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 5, Story 5.1; AC: inline edit, save blur/Enter, cancel Escape, one edit at a time, PATCH description, tests.
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — UX-DR3: TaskCard "task text (or inline edit field)"; Tab order checkbox → text/edit → delete; Enter saves edit. UX-DR12: inline edit activate by click on label or edit control; save on blur or Enter, cancel on Escape; one active edit at a time; validation non-empty, inline error.
- [Source: backend/src/routes/todos.ts] — PATCH handler currently sets only `completed`; extend to set `description` when present.
- [Source: backend/src/schemas/todos.schema.ts] — updateTaskRequestBodySchema has only `completed: z.boolean()`; add optional description and at-least-one refinement.
- [Source: frontend/src/components/TaskCard.tsx] — Current: span for description, no edit; add conditional input and edit callbacks.

---

## Developer Context

### Technical Requirements

- **PATCH description contract:** `PATCH /api/todos/:id` body may include `{ description?: string }` (and/or existing `completed?: boolean`). At least one of `completed` or `description` must be present. Description: non-empty after trim (same validation as POST). Success: 200, body = updated task. Not found: 404 NOT_FOUND. Validation (e.g. empty description): 400 VALIDATION_ERROR.
- **Backend handler:** Build `updates` from body: if `description !== undefined` set `updates.description = description` (after schema validation); if `completed !== undefined` set `updates.completed = completed`. Single `db.update(tasks).set(updates).where(eq(tasks.id, id)).returning()`. Return 200 with toApiTask(updated).
- **Frontend flow:** User clicks label (or edit control) → TaskList sets editingId → TaskCard shows input. User edits, saves (Enter or blur): trim; if empty show inline error and stay in edit mode; else updateTodo({ id, description }) → on success invalidate todosQueryKey, setEditingId(null). Cancel (Escape): setEditingId(null), no PATCH. Only one editingId at a time.
- **API client:** updateTodo(id, payload) with payload `{ completed?: boolean; description?: string }`. Send only defined keys in JSON body. Same fetch/error pattern as existing updateTodo.

### Architecture Compliance

- **Naming:** updateTodo(id, { completed?, description? }); useUpdateTodo() mutate({ id, completed?, description? }). PascalCase TaskCard, TaskList. Query key todosQueryKey; mutation invalidates same key.
- **Format:** Request/response camelCase; success = direct object; error = { code, message }. No change to existing formats.
- **State:** TanStack Query for server state; React state in TaskList for editingId only (which card is in edit mode). No global store.

### Library / Framework Requirements

- **TanStack Query v5:** useUpdateTodo mutationFn receives `{ id, completed?, description? }`; call updateTodo(id, payload) with only defined fields; onSuccess invalidate todosQueryKey unchanged.
- **React:** TaskList holds editingId (useState); TaskCard controlled by isEditing and callbacks. Inline input: controlled or uncontrolled with defaultValue and onSubmit; ensure blur and Enter both trigger save with current value.
- **Fastify + Zod:** Extend updateTaskRequestBodySchema with optional description and refine so at least one of completed or description present; same param validation for :id.

### File Structure Requirements

- **Must modify (backend):** `backend/src/schemas/todos.schema.ts` — add optional `description` to updateTaskRequestBodySchema; add `.refine(...)` so at least one of completed or description is present. `backend/src/routes/todos.ts` — in PATCH handler destructure `completed` and `description` from body; build `updates` object with only defined fields; `set(updates)` in single update call.
- **Must add/modify (backend tests):** `backend/tests/todos.test.ts` — add tests for PATCH with description (200 + updated task), PATCH with empty description (400), and ensure existing PATCH completed tests still pass.
- **Must modify (frontend):** `frontend/src/api/todos.ts` — extend updateTodo second argument to `{ completed?: boolean; description?: string }`; build request body with only present keys. `frontend/src/hooks/useUpdateTodo.ts` — mutationFn accepts `{ id, completed?, description? }` and calls updateTodo(id, payload). `frontend/src/components/TaskCard.tsx` — add isEditing, onStartEdit, onSaveEdit, onCancelEdit; conditional render span vs input; save on blur/Enter, cancel on Escape; tab order and a11y. `frontend/src/components/TaskList.tsx` — editingId state; pass edit props to TaskCard; handleSaveEdit calls updateTodo with description and clears editingId on success; handleCancelEdit clears editingId.
- **Tests:** Backend: PATCH description 200, PATCH empty description 400, no regression on PATCH completed. Frontend: TaskCard edit mode, save/cancel; TaskList single editingId; E2E: full edit flow and cancel.

### Testing Requirements

- **Coverage (AC):** PATCH description and inline-edit behavior covered by backend tests and frontend integration or E2E tests (NFR-V1, NFR-V2). Backend: PATCH with description returns 200 and updated task; PATCH with invalid/empty description returns 400. Frontend: activate edit → save → PATCH called with id and description, list updates; cancel → no PATCH; only one edit at a time. E2E: edit task description and assert list shows new text.
- **Pattern:** Reuse buildApp(), POST to create task, PATCH with body; assert response and GET list. Frontend: mock updateTodo or MSW; render TaskList with QueryClientProvider; trigger edit and save; assert mutation called with correct id and description.

### Previous Story Intelligence

- **Story 4.2 (Delete):** TaskCard has onDelete, delete button after time; tab order checkbox → text → delete. Add edit without breaking that order: checkbox → text (or edit input) → time → delete. Same callback pattern: optional onStartEdit, onSaveEdit, onCancelEdit. TaskList already uses useUpdateTodo for toggle; extend same hook for description update.
- **Story 4.1 (Complete):** PATCH route and updateTaskRequestBodySchema exist with `completed` only. Extend schema (optional description + at-least-one refinement); handler already does select-then-update-returning — change to build updates from body and set(updates). updateTodo and useUpdateTodo exist; extend payload and mutationFn to pass description.
- **Story 3.2 / 3.1:** createTodo trims and validates non-empty; AddTaskRow inline error on API failure. Reuse same validation for edit: trim, non-empty; show inline error on 400 (UX-DR12).
- **Tab order (UX-DR3):** checkbox → text/edit → delete. When in edit mode the input replaces the text; tab order remains logical (checkbox → input → time → delete or same as current).

### Latest Tech Information

- **TanStack Query v5:** useMutation mutationFn can take a single argument object; extend to `{ id, completed?, description? }`; type the payload so description is optional. Invalidation unchanged.
- **Fastify + Zod:** Optional fields with `.refine()` for "at least one of" is standard; keep 404 and 200 response schemas unchanged.
- **React controlled/uncontrolled:** For inline edit, either controlled input (value + onChange from parent) or uncontrolled with defaultValue and read value on blur/Enter; ensure Escape cancels without submitting. Single source of truth for "current description" is todo.description until save succeeds.

### Project Context Reference

- No project-context.md in repo. Follow architecture and epics as source of truth. User skill level: intermediate (config).

---

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

### Completion Notes List

- Task 1–2: Extended PATCH schema with optional description and at-least-one refinement; PATCH handler builds partial updates; added backend tests for description update, combined update, and empty/whitespace 400.
- Task 3: Extended updateTodo payload and useUpdateTodo mutationFn to support optional description; only defined fields sent in PATCH body.
- Task 4–6: TaskCard inline edit with button trigger, input on blur/Enter save and Escape cancel, editError prop for validation/API errors; TaskList editingId state and handlers with empty-description validation and inline error.
- Task 7: TaskCard and TaskList unit tests for edit mode, save/cancel, single-editingId; E2E edit flow, cancel, and empty-save error in tasks.spec.ts.

### File List

- backend/src/schemas/todos.schema.ts
- backend/src/routes/todos.ts
- backend/tests/todos.test.ts
- frontend/src/api/todos.ts
- frontend/src/hooks/useUpdateTodo.ts
- frontend/src/components/TaskCard.tsx
- frontend/src/components/TaskCard.test.tsx
- frontend/src/components/TaskList.tsx
- frontend/src/components/TaskList.test.tsx
- frontend/e2e/tasks.spec.ts

### Change Log

- 2026-03-18: Story 5.1 implemented — PATCH description, inline edit in TaskCard, TaskList editing state, validation/inline error, backend and frontend tests, E2E edit flow.
