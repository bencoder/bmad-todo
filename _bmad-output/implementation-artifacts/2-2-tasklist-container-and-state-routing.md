# Story 2.2: TaskList container and state routing

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the app to show exactly one of: loading, empty, error, or list,
so that I always see a clear state and know what to do next.

## Acceptance Criteria

1. **Given** the TaskList component is rendered  
   **When** data and API state are available  
   **Then** the UI shows exactly one of: LoadingState (while loading), EmptyState (when list is empty), ErrorState (when fetch failed), or the list of TaskCards (when data exists)  
   **And** AddTaskRow (or add affordance) is at the top of the list area  
   **And** After refresh or a new session, the same list loads from the API and persists (FR15, FR16)  
   **And** State routing (loading / empty / error / list) is covered by unit or integration tests  

## Tasks / Subtasks

- [x] **Task 1: AddTaskRow component (presentational)** (AC: #1)
  - [x] Create `frontend/src/components/AddTaskRow.tsx`: text input + primary button ("Add"); placeholder "Add a task"; visible label or aria-label for input
  - [x] Use Direction C: one primary accent for Add; Tailwind; no submit behavior yet (onSubmit no-op or prevent default); wire to API in Epic 3 Story 3.2
  - [x] Accessibility: label or aria-label; button type="submit"; Enter can submit (handler can be no-op in this story)
- [x] **Task 2: TaskList component and state routing** (AC: #1)
  - [x] Create `frontend/src/components/TaskList.tsx`: call `useTodos()`; render exactly one of LoadingState, EmptyState, ErrorState, or list of TaskCards based on isLoading, isError, data
  - [x] Order of branches: loading → error → empty (no data or data.length === 0) → list. Match existing App order so behavior is unchanged
  - [x] List branch: wrapper with max-width (e.g. 560px), padding (e.g. p-6), centered (mx-auto); AddTaskRow at top; then `<ul role="list">` of TaskCards with gap between cards
  - [x] Use same getErrorMessage pattern as App (or accept error and refetch props); ErrorState receives message and onRetry (refetch)
  - [x] Preserve main wrapper: `<main className="min-h-screen flex flex-col">` with TaskList as child, or TaskList renders the main and inner content
- [x] **Task 3: Refactor App to use TaskList** (AC: #1)
  - [x] In `App.tsx`: remove inline loading/error/empty/list branches; render `<main className="min-h-screen flex flex-col"><TaskList /></main>` (or TaskList wraps main content)
  - [x] Ensure QueryClientProvider and existing setup unchanged; no duplicate useTodos() if TaskList owns the hook call
- [x] **Task 4: Tests for state routing and TaskList** (AC: #1)
  - [x] Unit or integration tests: TaskList shows LoadingState when isLoading; ErrorState when isError with message and retry; EmptyState when data empty; list with AddTaskRow + TaskCards when data has items
  - [x] Mock useTodos to control data, isLoading, isError, refetch; assert exactly one state component or list is rendered per branch
  - [x] AddTaskRow: render test (input, button present; placeholder "Add a task"); optional a11y checks
  - [x] Place tests in `frontend/src/__tests__/TaskList.test.tsx`, `AddTaskRow.test.tsx` or co-located; use Vitest and React Testing Library

## Dev Notes

- **Epic 2 goal:** View persisted task list — user sees saved tasks with completed vs active distinguished and creation time visible; list appears with no blocking delay; data persists across refresh/sessions (FR2, FR3, FR4, FR15, FR16).
- **Story 2.2 scope:** Introduce TaskList as the single container that owns state routing (loading/empty/error/list) and places AddTaskRow at the top. Story 2.1 already added TaskCard and list-of-cards in App; this story extracts that into TaskList and adds AddTaskRow at top. AddTaskRow does not call POST until Epic 3 Story 3.2.
- **State order:** Preserve current App order: loading → error → empty → list. Same getErrorMessage logic so ErrorState shows consistent messages.
- **Persistence (FR15, FR16):** No backend or API changes; TanStack Query and existing GET /api/todos already provide persistence across refresh/session. TaskList just consumes useTodos(); no extra work for persistence.

### Project Structure Notes

- **Architecture:** TaskList is the wrapper (max-width, padding) containing AddTaskRow then list of TaskCards or EmptyState/LoadingState/ErrorState (UX-DR4). Components live in `frontend/src/components/`. App becomes thin: main + TaskList.
- **AddTaskRow:** Presentational in 2.2 (input + button, no API call). Epic 3 Story 3.2 adds useCreateTodo (or useTodoMutations) and wires submit to POST.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — TaskList, AddTaskRow in component set; single view; state routing; frontend src/components/.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 2, Story 2.2; AC: exactly one of loading/empty/error/list; AddTaskRow at top; FR15, FR16.
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — UX-DR4 TaskList anatomy; UX-DR2 AddTaskRow anatomy; Direction C; button hierarchy (primary for Add).
- [Source: _bmad-output/implementation-artifacts/2-1-display-task-list-with-taskcards.md] — App currently has four branches; list branch uses max-w-[560px], ul role="list", TaskCard; getErrorMessage; useTodos shape.

---

## Developer Context

### Technical Requirements

- **Stack:** Frontend only. Vite, React 18, TypeScript, Tailwind, TanStack Query. Reuse useTodos(), LoadingState, EmptyState, ErrorState, TaskCard. No backend changes.
- **State routing:** Exactly one of: LoadingState (isLoading), ErrorState (isError with message + onRetry), EmptyState (!data or data.length === 0), or list (AddTaskRow + ul of TaskCards). Order: loading → error → empty → list.
- **AddTaskRow (2.2):** Input + primary button "Add"; placeholder "Add a task"; label or aria-label; no POST or mutation in this story. Epic 3.2 wires submit.
- **TaskList:** Can call useTodos() internally and own all four branches; or receive props from App. Recommended: TaskList calls useTodos() so App only renders main + TaskList.
- **Container:** Same as current list branch: max-w-[560px], p-6, mx-auto; AddTaskRow at top; then ul with role="list", list-none, gap-2, map data to TaskCard.

### Architecture Compliance

- **Components:** TaskList and AddTaskRow are from the UX set (architecture § Frontend Architecture, § Project Structure). PascalCase: TaskList.tsx, AddTaskRow.tsx in frontend/src/components/.
- **Naming:** TaskList, AddTaskRow; useTodos() unchanged. No new API or hooks in this story.
- **State flow:** TanStack Query useTodos() drives loading/error/empty/list; TaskList consumes it and renders one branch. No global state beyond Query cache.
- **Main wrapper:** Keep `<main className="min-h-screen flex flex-col">` so layout and a11y are unchanged; TaskList renders inside it (or TaskList returns fragment and App wraps in main).

### Library / Framework Requirements

- **React:** No new dependencies. Use existing Tailwind, React 18, TanStack Query. Type TaskList and AddTaskRow props; AddTaskRow may have optional onSubmit prop (no-op in 2.2).
- **TanStack Query:** useTodos() as-is; query key and refetch unchanged. TaskList uses same hook so cache and refetch behavior persist.

### File Structure Requirements

- **Must create:** `frontend/src/components/TaskList.tsx`, `frontend/src/components/AddTaskRow.tsx`.
- **Must modify:** `frontend/src/App.tsx` — replace all four branches with `<main><TaskList /></main>` (and keep QueryClientProvider in root if it lives above App).
- **Must not change:** useTodos, api/todos, TaskCard, LoadingState, EmptyState, ErrorState implementations. Do not add POST or mutation hooks (Epic 3).
- **Must preserve:** getErrorMessage logic (move into TaskList or shared util so ErrorState gets same message); main wrapper and layout.

### Testing Requirements

- **Coverage (AC #1):** State routing (loading / empty / error / list) must be covered by unit or integration tests.
- **TaskList tests:** Mock useTodos to return isLoading true → assert LoadingState rendered; isError true → ErrorState with message and retry; data [] or undefined → EmptyState; data with items → AddTaskRow + ul with TaskCards. Use React Testing Library; wrap in QueryClientProvider if TaskList uses useTodos internally.
- **AddTaskRow tests:** Render; assert input (placeholder "Add a task"), button "Add"; optional aria-label or label; submit no-op or preventDefault so no console errors.
- **Placement:** `frontend/src/__tests__/TaskList.test.tsx`, `AddTaskRow.test.tsx` or co-located. Update App.test.tsx if it currently asserts on inline branches — assert App renders TaskList (or main contains TaskList) and delegate branch assertions to TaskList tests.

### Previous Story Intelligence

- **Story 2.1:** App has loading → error → empty → list branches; list branch is max-w-[560px] container, `<ul role="list">` with list-none gap-2, map data to TaskCard. getErrorMessage used for ErrorState; refetch() for onRetry. TaskCard exists and takes `todo: Todo`. Do not change TaskCard or useTodos; extract branches into TaskList and add AddTaskRow at top of list area.
- **Story 1.5:** useTodos returns data, isLoading, isError, error, refetch. ErrorState and LoadingState/EmptyState already implemented. Reuse them inside TaskList; do not duplicate.
- **Testing pattern:** App tests use QueryClientProvider, mock fetch or useTodos; waitFor for async. Use same pattern for TaskList; mock useTodos at the hook level or provide a test wrapper that injects mock return values.

### Latest Tech Information

- **TanStack Query v5:** useQuery returns isLoading, isError, error, data, refetch. Initial load uses isLoading; refetch uses isFetching. For "exactly one state" ensure isLoading takes precedence over isError for initial load if needed (typical order: loading → error → empty → list).
- **React Testing Library:** To test component that uses useTodos(), wrap in QueryClientProvider with custom defaultOptions or mock the hook (e.g. jest.mock('./hooks/useTodos')).

### Project Context Reference

- No `project-context.md` in repo. Follow architecture and epics as source of truth. User skill level: intermediate (per config).

---

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

### Completion Notes List

- Task 1: Created AddTaskRow.tsx with text input (placeholder "Add a task"), primary "Add" button (bg-blue-600), sr-only label + aria-label, form onSubmit preventDefault and optional onSubmit callback. No API call in this story.
- Task 2: Created TaskList.tsx calling useTodos(); state order loading → error → empty → list. List branch: max-w-[560px] p-6 mx-auto, AddTaskRow at top, ul role="list" with TaskCards (gap-2). getErrorMessage inlined; ErrorState gets message and onRetry (refetch).
- Task 3: Refactored App.tsx to render only main + TaskList; QueryClientProvider unchanged in root.
- Task 4: AddTaskRow.test.tsx (5 tests): placeholder, Add button, a11y label, submit no-throw, optional onSubmit. TaskList.test.tsx (5 tests): LoadingState, ErrorState with retry, EmptyState ([] and undefined), list with AddTaskRow + TaskCards and container. All 42 tests pass; lint clean.

### File List

- frontend/src/components/AddTaskRow.tsx (new)
- frontend/src/components/AddTaskRow.test.tsx (new)
- frontend/src/components/TaskList.tsx (new)
- frontend/src/components/TaskList.test.tsx (new)
- frontend/src/App.tsx (modified)

### Change Log

- 2026-03-17: Implemented TaskList container and state routing; AddTaskRow presentational; refactored App to main + TaskList; added unit tests for AddTaskRow and TaskList (state routing). All AC satisfied; story ready for review.
