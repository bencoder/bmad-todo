# Story 1.4: Empty state when there are no tasks

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see a clear empty state when I have no tasks,
so that I know the app is working and how to add my first task.

## Acceptance Criteria

1. **Given** `GET /api/todos` returns an empty array  
   **When** the frontend has finished loading  
   **Then** the UI shows an empty state with a short message (e.g. "No tasks yet")  
   **And** There is an obvious add affordance (e.g. add input or "Add your first task" control)  
   **And** The empty state and add affordance are focusable and screen-reader accessible  
   **And** The empty state is covered by unit or integration tests

## Tasks / Subtasks

- [x] **Task 1: EmptyState component** (AC: #1)
  - [x] Create `frontend/src/components/EmptyState.tsx`: display short message "No tasks yet" (or equivalent) and a visible add affordance
  - [x] Add affordance: either a focusable button/link "Add your first task" with clear label, or a minimal AddTaskRow (input + "Add" button) presentational only—no POST wiring yet (story 3.2)
  - [x] Use Tailwind for layout; keep styling consistent with LoadingState (e.g. same container/section semantics)
  - [x] Ensure message and add control are focusable and have appropriate labels/aria for screen readers (UX-DR5)
- [x] **Task 2: State routing in App** (AC: #1)
  - [x] In `App.tsx`: when `!isLoading` and `data` is an array with `data.length === 0`, render `EmptyState` instead of the current placeholder
  - [x] Preserve existing behavior: when loading, show `LoadingState`; when loaded with tasks (`data.length > 0`), keep current placeholder or minimal list shell until story 2.1
  - [x] Do not render EmptyState while loading; only when fetch has completed and array is empty
- [x] **Task 3: Tests for empty state** (AC: #1)
  - [x] Unit or integration tests: when useTodos returns success with empty array, UI shows EmptyState with "No tasks yet" (or equivalent) and the add affordance is present and focusable
  - [x] Optionally assert accessible name/label for add control and that empty state is not shown while loading
  - [x] Place tests in `frontend/src/__tests__/` or co-located; use Vitest and React Testing Library; mock API to return `[]`

## Dev Notes

- **Epic 1 goal:** Runnable app and empty list experience. Story 1.4 adds the empty state so when the user has no tasks they see a clear message and know how to add one. Story 1.5 adds error state and retry.
- **Story 1.3 baseline:** App uses `useTodos()`; when `isLoading` shows `LoadingState`; when loaded shows a placeholder with task count. Currently "0 tasks loaded." is shown for empty data—replace that path with EmptyState.
- **Add affordance scope:** POST and full add-task flow are story 3.1 (API) and 3.2 (AddTaskRow + UI). For 1.4, the add affordance only needs to be visible and focusable (e.g. button "Add your first task"); it may be a placeholder that does nothing, or a minimal input + button that does not yet call the API.
- **State order:** App must show exactly one of: loading → then empty **or** list (or error in 1.5). When `data?.length === 0` after load, show EmptyState only.

### Project Structure Notes

- **Frontend (from architecture):** `src/components/EmptyState.tsx`; `App.tsx` already has loading branch and placeholder; add empty branch when `!isLoading && data && data.length === 0`.
- **Do not add** ErrorState or full TaskCard/list UI in this story. Do not wire add affordance to POST until story 3.2.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — EmptyState in component set; state routing one of loading/empty/error/list; Process Patterns.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 1, Story 1.4; FR19; UX-DR5 EmptyState.
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — UX-DR5 EmptyState: "No tasks yet", add affordance, focusable and screen-reader accessible.
- [Source: _bmad-output/implementation-artifacts/1-3-frontend-fetch-and-loading-state.md] — useTodos shape, App layout, LoadingState; replace placeholder for empty data with EmptyState.

---

## Developer Context

### Technical Requirements

- **Stack (this story):** Frontend only. Vite, React 18, TypeScript, Tailwind, TanStack Query. No backend changes.
- **Condition for empty state:** `!isLoading && data && Array.isArray(data) && data.length === 0`. Use the same `useTodos()` return shape as story 1.3 (`data`, `isLoading`, etc.).
- **Accessibility:** Message and add affordance must be focusable (keyboard) and have accessible names (e.g. visible text or aria-label). No state conveyed by color alone.

### Architecture Compliance

- **Components:** EmptyState is one of the UX set (TaskList, TaskCard, AddTaskRow, EmptyState, LoadingState, ErrorState). PascalCase file `EmptyState.tsx` in `frontend/src/components/`.
- **State routing:** TaskList (or App as the list root) shows exactly one of: LoadingState (when isLoading), EmptyState (when loaded and data.length === 0), later ErrorState (story 1.5), or list (when data.length > 0). Implement the empty branch in this story.
- **Naming:** Component name `EmptyState`; no new hooks required; reuse `useTodos()` from story 1.3.

### Library / Framework Requirements

- **React:** No new dependencies. Use existing Tailwind and React 18.
- **TanStack Query:** `data` from `useTodos()` is `Todo[] | undefined`; empty state when `data` is defined and `data.length === 0` after load.

### File Structure Requirements

- **Must create:** `frontend/src/components/EmptyState.tsx`.
- **Must modify:** `frontend/src/App.tsx` — add branch: when `!isLoading && data && data.length === 0`, render `<EmptyState />` (or with props if needed); remove or replace the "0 tasks loaded" placeholder for empty data.
- **Must not create:** ErrorState, TaskCard, TaskList, or wire AddTaskRow to API. Do not change backend or `useTodos`/api/todos.
- **Must preserve:** LoadingState when `isLoading`; existing placeholder or shell when `data.length > 0`; `main.tsx`, QueryClientProvider, and API client.

### Testing Requirements

- **Coverage (AC #1):** Empty state and its visibility when API returns empty array must be covered by unit or integration tests.
- **Placement:** `frontend/src/__tests__/` or co-located (e.g. `EmptyState.test.tsx`, `App.test.tsx`).
- **Approach:** Vitest + React Testing Library. Mock `useTodos` or the API so that after "load", `data` is `[]`. Assert that EmptyState is rendered (e.g. "No tasks yet" text), add affordance is present and focusable (e.g. getByRole('button') or getByText with accessible name). Do not require ErrorState or list UI.

### Previous Story Intelligence

- **Story 1.3:** App uses `useTodos()`; when `isLoading` renders `<LoadingState />`; when loaded renders a placeholder with title and `data.length` text ("0 tasks loaded." when empty). Replace the empty-data path with EmptyState; keep loading and non-empty paths unchanged.
- **Files to touch:** `App.tsx` (add empty branch); create `EmptyState.tsx`. Reuse `useTodos`, `LoadingState`, `fetchTodos`, and types from 1.3.
- **Testing pattern:** Story 1.3 used QueryClientProvider wrapper and mocked fetch; use same pattern so that when query succeeds with `[]`, component tree shows EmptyState.

### Latest Tech Information

- **Accessibility:** Use semantic HTML (e.g. `<p>` for message, `<button>` or `<a>` for add affordance). For "Add your first task", prefer `<button type="button">Add your first task</button>` or equivalent with visible text so screen readers get the label without extra aria-label. If using an input + button, ensure both have labels (placeholder is not sufficient for accessibility; use aria-label or associated label).

### Project Context Reference

- No `project-context.md` in repo. Follow architecture and epics as source of truth. User skill level: intermediate (per config).

---

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

### Completion Notes List

- Task 1: Created `EmptyState.tsx` with section semantics, "No tasks yet" message, and focusable `<button type="button">Add your first task</button>`. Styling aligned with LoadingState (flex, gap-4, p-8, min-h-[12rem]). aria-label on section for screen readers.
- Task 2: In `App.tsx` added branch: when `!isLoading && data && data.length === 0` render `<EmptyState />` inside main. Loading and non-empty paths unchanged.
- Task 3: Added `EmptyState.test.tsx` (message, focusable add affordance, section semantics). Updated `App.test.tsx`: empty fetch shows empty state; added "shows empty state when fetch returns empty array" and "does not show empty state while loading". All 15 tests pass; lint clean.

### File List

- frontend/src/components/EmptyState.tsx (new)
- frontend/src/components/EmptyState.test.tsx (new)
- frontend/src/App.tsx (modified)
- frontend/src/App.test.tsx (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)

### Change Log

- 2026-03-17: Story 1-4 implemented. EmptyState component, App state routing for empty list, tests for empty state and loading/empty separation.
