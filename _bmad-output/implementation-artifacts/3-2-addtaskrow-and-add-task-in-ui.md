# Story 3.2: AddTaskRow and add task in UI

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to add a task by typing and submitting in one or two actions,
so that the new task appears in the list right away without extra steps.

## Acceptance Criteria

1. **Given** the list is visible (empty or with tasks)  
   **When** I focus the add input, type a description, and submit (Enter or Add button)  
   **Then** a new task is created via POST and appears in the list (optimistic or after response)  
   **And** The input clears after successful add; description is trimmed  
   **And** AddTaskRow has a visible label or aria-label; Enter submits; flow completes in under 10 seconds under normal conditions (NFR-P2)  
   **And** If the API returns an error, an inline error is shown and the user can correct or retry (UX-DR12)  
   **And** The add-task flow is covered by integration or E2E tests (NFR-V1)

## Tasks / Subtasks

- [x] **Task 1: API client and create mutation** (AC: #1)
  - [x] In `frontend/src/api/todos.ts`: add `createTodo(description: string)` that POSTs `{ description }` to `/api/todos`, returns created task (camelCase, `Todo` shape), throws on non-2xx with error message from body or statusText
  - [x] In `frontend/src/hooks/`: add `useCreateTodo()` (or extend a single `useTodoMutations`) using TanStack Query `useMutation`; on success invalidate `todosQueryKey` (or `['todos']`) so list refetches; return `{ mutate, mutateAsync, isPending, isError, error }` as needed
- [x] **Task 2: Wire AddTaskRow to create and clear input** (AC: #1)
  - [x] In `TaskList.tsx`: get create mutation from hook; pass to AddTaskRow an `onSubmit` that calls mutation with trimmed description; on success clear the add input (AddTaskRow must support controlled clear, e.g. callback after success or reset from parent)
  - [x] AddTaskRow: after parent calls onSubmit, parent is responsible for success; AddTaskRow clears input on submit when value was non-empty (or parent passes a ref/signal to clear). Prefer: AddTaskRow receives `onSubmit(trimmedValue)` and parent, on mutation success, can clear by resetting a key or passing clearInput ref — or AddTaskRow clears input immediately on submit and parent handles mutate; if mutation fails show inline error without re-populating. Specify: clear input only after successful add (so if API fails, keep the typed value for retry).
- [x] **Task 3: AddTaskRow visible in empty state** (AC: #1)
  - [x] When list is empty, user must be able to add from the same AddTaskRow. Ensure TaskList shows AddTaskRow at top for both empty and list states: render AddTaskRow then either EmptyState (when no tasks) or the list of TaskCards. So empty branch becomes: AddTaskRow + EmptyState (or AddTaskRow + "No tasks yet" message only). Do not require user to leave empty state to add; AddTaskRow is the add affordance (UX-DR5).
- [x] **Task 4: Inline error on API failure** (AC: #1)
  - [x] AddTaskRow or TaskList: when create mutation fails, show inline error message (e.g. below the input or under Add button); use error token or existing error styling; message from API `body.message` or generic "Couldn't add task". User can correct (e.g. retry with same or new text) or retry; do not clear input on failure so they can edit and resubmit (UX-DR12).
- [x] **Task 5: Accessibility and flow** (AC: #1)
  - [x] AddTaskRow already has label/aria-label and Enter submits; ensure no regression. Optional: disable Add button or input while mutation is pending to prevent double submit; if disabled, ensure focus and screen reader state are correct (aria-busy or aria-disabled).
- [x] **Task 6: Tests for add-task flow** (AC: #1)
  - [x] Integration or E2E: submit with valid description → POST called (or list updates); input clears after success; trimmed description sent. Test error path: mock API to return 400/500 → inline error shown, input not cleared. Use Vitest + React Testing Library with mocked fetch/API or MSW; or Playwright E2E for full flow. Cover at least: success adds task and clears input; failure shows inline error.

## Dev Notes

- **Epic 3 goal:** Add tasks — user can add a new task with a short description in one or two actions and see the new task appear in the list immediately (FR5, FR6, FR7). Story 3.1 delivered POST /api/todos; this story wires the UI to it.
- **Existing backend:** POST /api/todos accepts `{ description: string }` (Zod non-empty trim); returns 201 and created task `{ id, description, completed, createdAt }`; 400 on validation with `{ code: 'VALIDATION_ERROR', message }`. Reuse this contract in frontend API and types.
- **Existing AddTaskRow:** Presentational in 2.2; has `onSubmit?(value: string)` with trimmed value, form submit, Enter, label/aria-label. No clearInput yet — add clear only after successful mutation; on failure keep value and show inline error.

### Project Structure Notes

- **Frontend:** `frontend/src/api/todos.ts` (add createTodo), `frontend/src/hooks/` (useCreateTodo or useTodoMutations), `frontend/src/components/AddTaskRow.tsx` (optional props for error state, clear, or disabled), `frontend/src/components/TaskList.tsx` (wire mutation, empty state with AddTaskRow).
- **Architecture (§ Communication Patterns):** Mutations invalidate query key `['todos']` so list refetches; no custom event bus. API layer in `api/todos.ts`; hooks in `hooks/`.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — TanStack Query mutations, invalidate ['todos']; API camelCase; error { code, message }; frontend api/todos, hooks.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 3, Story 3.2; AC: POST, clear input, trim, label/Enter, inline error, tests.
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — UX-DR2 AddTaskRow (states: default, focus, disabled, error); UX-DR12 inline error on API fail; UX-DR5 empty state add affordance.
- [Source: backend/src/routes/todos.ts] — POST /api/todos body and 201 response shape.
- [Source: _bmad-output/implementation-artifacts/3-1-create-task-api-post.md] — POST contract and completion notes.

---

## Developer Context

### Technical Requirements

- **API create:** `POST /api/todos` body `{ description: string }`; success 201, body = `{ id, description, completed, createdAt }` (camelCase, ISO 8601 createdAt). Validation failure 400, body `{ code: 'VALIDATION_ERROR', message }`. Other errors 4xx/5xx with `{ code, message }`. Frontend must send trimmed non-empty description; backend validates.
- **Frontend flow:** User types in AddTaskRow → submit (Enter or Add) → call createTodo(trimmed) → on success: invalidate ['todos'], clear input, list updates (refetch). On failure: show inline error under AddTaskRow, do not clear input; user can retry or edit.
- **Empty state:** List visible (empty or with tasks) includes AddTaskRow. When data is empty, render AddTaskRow at top then EmptyState (or "No tasks yet" only) so user can add first task without another screen. Do not hide AddTaskRow when list is empty.
- **Trim:** Trim description before sending; empty after trim should not trigger POST (client-side guard) or will get 400 from backend — handle 400 as inline error.

### Architecture Compliance

- **Naming:** createTodo in api/todos.ts; useCreateTodo (or useTodoMutations) in hooks; PascalCase components. Query key `['todos']` or reuse `todosQueryKey` from useTodos.
- **Format:** Request body camelCase `{ description }`; response matches Todo type (id, description, completed, createdAt). Error from API: use body.message or fallback for inline display.
- **State:** TanStack Query only; mutation invalidates list query; no global state beyond Query cache. TaskList uses useTodos() and useCreateTodo(); passes onSubmit to AddTaskRow that calls mutation.

### Library / Framework Requirements

- **TanStack Query (React Query):** useMutation for create; mutationFn calls createTodo(description); onSuccess: queryClient.invalidateQueries({ queryKey: todosQueryKey }) (or ['todos']). Expose isPending for optional disabled state during submit.
- **React:** AddTaskRow remains controlled by parent for when to clear input: either AddTaskRow accepts an effect (e.g. reset when a "lastAddedId" or success prop changes) or parent uses a ref to call clearInput on AddTaskRow after success. Simpler: AddTaskRow clears its own input in onSubmit after calling onSubmit(value), and parent only calls mutate; then on success we've already cleared — but AC says "clear after successful add", so clear only on success. So parent must either pass a callback "onSuccess" to AddTaskRow that AddTaskRow calls after parent reports success, or AddTaskRow is uncontrolled and parent re-mounts/resets it on success (e.g. key={listLength}), or AddTaskRow gets a prop like resetTrigger that when changed clears the input. Recommended: AddTaskRow receives onSuccess callback from parent; parent in onSubmit calls mutateAsync(trimmed), then on success calls onSuccess() and AddTaskRow in onSuccess clears inputRef.current.value = ''.
- **Fetch/API:** Same pattern as fetchTodos: getTodosUrl() base, POST to same URL, res.ok check, res.json() for body, throw Error(message) on failure so TanStack Query sees rejection.

### File Structure Requirements

- **Must add/modify:** `frontend/src/api/todos.ts` — add createTodo(description: string): Promise<Todo>.
- **Must add:** `frontend/src/hooks/useCreateTodo.ts` (or `useTodoMutations.ts` with createTodo mutation). Export useCreateTodo and use it in TaskList.
- **Must modify:** `frontend/src/components/TaskList.tsx` — use useCreateTodo (or mutation hook); pass onSubmit to AddTaskRow that trims and calls mutation; on success clear AddTaskRow input (via callback or ref); when empty, render AddTaskRow then EmptyState so add is available.
- **Must modify:** `frontend/src/components/AddTaskRow.tsx` — support optional inline error message (prop, e.g. error?: string), optional onSuccess callback so parent can signal success and AddTaskRow clears input; keep existing label/aria-label and Enter submit.
- **Tests:** Add integration tests (e.g. TaskList or AddTaskRow with mocked createTodo) for success (POST called, list invalidated, input clears) and error (inline error shown, input retained). Place in `frontend/src/components/AddTaskRow.test.tsx` and/or `TaskList.test.tsx`, or E2E in `frontend/e2e/`.

### Testing Requirements

- **Coverage (AC):** Add-task flow covered by integration or E2E tests (NFR-V1). At minimum: (1) submit valid description → createTodo called with trimmed value, query invalidated (or list refetched), input cleared; (2) API returns error → inline error displayed, input not cleared; (3) optional: empty description after trim does not call API or shows validation message.
- **Pattern:** Mock fetch or api/todos.createTodo in tests; or use MSW to stub POST /api/todos. React Testing Library: render TaskList with QueryClientProvider, mock useTodos to return data (or empty), trigger AddTaskRow submit, assert mutation called and either refetch or invalidation; for error, mock rejection and assert error UI.
- **E2E (optional but recommended):** Playwright: open app, wait for list (or empty), type in add input, submit, assert new task appears in list and input is empty.

### Previous Story Intelligence

- **Story 3.1 (Create task API POST):** Backend POST /api/todos is done; body createTaskRequestBodySchema (description non-empty trim), 201 + taskResponseSchema, 400 VALIDATION_ERROR. No frontend changes in 3.1. Use this contract exactly: createTodo(description) POSTs { description }, expects 201 and Todo-shaped body.
- **Story 2.2 (TaskList, AddTaskRow):** AddTaskRow is presentational; TaskList renders AddTaskRow only in the "list" branch (when data has items). Empty branch renders only EmptyState — no AddTaskRow. For 3.2, change empty branch to show AddTaskRow + EmptyState so user can add first task from empty view. AddTaskRow already has onSubmit(trimmedValue), label, Enter submit; 2.2 tests confirm these. Do not remove or break existing AddTaskRow tests; extend them for new behavior (clear on success, error prop).
- **Story 2.1 / 1.x:** useTodos, fetchTodos, todosQueryKey live in hooks and api; TaskCard and list structure unchanged. Only add createTodo and mutation hook; TaskList and AddTaskRow get the wiring.

### Latest Tech Information

- **TanStack Query v5:** useMutation takes mutationFn, onSuccess; queryClient.invalidateQueries({ queryKey: ['todos'] }). isPending replaces isLoading for mutations. Use the same QueryClient and queryKey as useTodos so invalidation refetches the list.
- **React 18:** Controlled vs uncontrolled input: for "clear on success", either uncontrolled input with ref and ref.current.value = '' in a callback from parent, or controlled with local state and parent passes resetTrigger to clear. Uncontrolled + onSuccess callback from parent is minimal and matches existing AddTaskRow ref usage.

### Project Context Reference

- No project-context.md in repo. Follow architecture and epics as source of truth. User skill level: intermediate (config).

---

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

### Completion Notes List

- Task 1: Added `createTodo(description)` in `frontend/src/api/todos.ts` (POST `{ description }`, returns Todo, throws on non-2xx with body.message or statusText). Added `useCreateTodo()` in `frontend/src/hooks/useCreateTodo.ts` with TanStack Query useMutation, invalidates `todosQueryKey` on success, returns mutate, mutateAsync, isPending, isError, error.
- Task 2–5: TaskList uses useCreateTodo; passes onSubmit that trims and calls mutateAsync, clears add input via clearInputRef after success. AddTaskRow accepts clearInputRef (parent calls ref.current() on success), error prop (inline message), disabled (while pending). Empty branch now renders AddTaskRow then EmptyState so add is available when list is empty. Inline error shown below form (role="alert"); input/button disabled and aria-busy when pending.
- Task 6: Added api/todos.test.ts tests for createTodo (POST success, trim, non-2xx body.message, statusText fallback). AddTaskRow tests: error display, clearInputRef clears input, disabled state. TaskList tests: mock useCreateTodo; empty state shows AddTaskRow; submit trimmed value and clear on success; inline error when create fails; empty-after-trim does not call mutation.

### File List

- frontend/src/api/todos.ts (modified)
- frontend/src/api/todos.test.ts (modified)
- frontend/src/hooks/useCreateTodo.ts (new)
- frontend/src/components/AddTaskRow.tsx (modified)
- frontend/src/components/AddTaskRow.test.tsx (modified)
- frontend/src/components/TaskList.tsx (modified)
- frontend/src/components/TaskList.test.tsx (modified)

### Change Log

- 2026-03-17: Implemented Story 3.2 — AddTaskRow and add task in UI: createTodo API, useCreateTodo hook, TaskList wiring (onSubmit, clear on success, AddTaskRow in empty state), inline error and disabled state, integration tests.
