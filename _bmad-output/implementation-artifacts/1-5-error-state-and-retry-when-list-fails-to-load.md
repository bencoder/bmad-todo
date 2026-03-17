# Story 1.5: Error state and retry when list fails to load

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see a clear error state and a way to retry when the list cannot be loaded,
so that I am never left on a blank or cryptic screen.

## Acceptance Criteria

1. **Given** the list fetch fails (e.g. network or server error)  
   **When** the frontend receives an error  
   **Then** the UI shows an error state with a clear message (e.g. "Couldn't load tasks")  
   **And** A Retry control is visible and focusable; activating it triggers a refetch  
   **And** The error message is announced (e.g. aria-live) and the user is never on a blank screen  
   **And** The error state and retry behavior are covered by unit or integration tests

## Tasks / Subtasks

- [x] **Task 1: ErrorState component** (AC: #1)
  - [x] Create `frontend/src/components/ErrorState.tsx`: display a clear error message (e.g. "Couldn't load tasks") and a Retry button
  - [x] Accept props: `message?: string` (optional, default "Couldn't load tasks"), `onRetry: () => void` (called when Retry is clicked)
  - [x] Use Tailwind for layout; keep styling consistent with EmptyState/LoadingState (same container/section semantics, padding, min-height)
  - [x] Retry button: primary style per UX-DR7/UX-DR11; focusable, with visible label "Retry" (and aria-label if icon-only)
  - [x] Use `aria-live="assertive"` or `aria-live="polite"` on the error message region so assistive tech announces the error (UX-DR7)
- [x] **Task 2: State routing in App for error** (AC: #1)
  - [x] In `App.tsx`: when `useTodos()` returns `isError === true`, render `ErrorState` with `onRetry` set to `refetch` from useTodos
  - [x] Add the error branch **before** the empty and list branches (e.g. after loading: if isError → ErrorState; else if empty → EmptyState; else list)
  - [x] Pass a user-friendly message from `error` if available (e.g. from API body `message`) or use default "Couldn't load tasks"
  - [x] Ensure user is never shown a blank screen: when fetch fails, only ErrorState is shown until retry succeeds
- [x] **Task 3: Tests for error state and retry** (AC: #1)
  - [x] Unit or integration tests: when useTodos returns isError (e.g. mock fetch to reject or return 500), UI shows ErrorState with message and Retry button
  - [x] Test that activating Retry calls refetch (mock refetch and assert it was called)
  - [x] Assert error message is present and Retry is focusable/labeled; optionally assert aria-live on error region
  - [x] Place tests in `frontend/src/__tests__/` or co-located; use Vitest and React Testing Library; mock API to fail

## Dev Notes

- **Epic 1 goal:** Runnable app and empty list experience. Story 1.5 adds the error state and retry so when the list fetch fails the user sees a clear message and can retry; story 1.4 added empty state.
- **Story 1.3/1.4 baseline:** App uses `useTodos()` which already exposes `isError`, `error`, and `refetch`. Currently App has branches: loading → LoadingState; empty (data.length === 0) → EmptyState; else placeholder with task count. There is **no** error branch yet—failed fetch falls through to the default view. Add the error branch so failed load shows ErrorState.
- **State order:** Show exactly one of: LoadingState (isLoading) → ErrorState (isError) → EmptyState (data empty) → list (data with items). Check error **after** loading so we don't show ErrorState while still loading.
- **Retry behavior:** TanStack Query's `refetch()` is already returned from useTodos; pass it to ErrorState as onRetry. On Retry click, call refetch(); when refetch succeeds, query state flips to success and App will re-render to show list or empty state.

### Project Structure Notes

- **Frontend (from architecture):** `src/components/ErrorState.tsx`; App shows one of LoadingState, EmptyState, ErrorState, or list. Add ErrorState branch when `isError === true`.
- **Do not add** TaskCard, full TaskList, or other epic-2+ UI. Do not change backend or useTodos query key/fn; only add error branch and new component.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — ErrorState in component set; Process Patterns (error handling, frontend use TanStack Query isError/error/refetch); state routing one of loading/empty/error/list.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 1, Story 1.5; FR21, FR22, FR23; acceptance criteria.
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — UX-DR7 ErrorState: message + Retry, aria-live, Retry focusable and labeled; UX-DR11 primary for Retry.
- [Source: _bmad-output/planning-artifacts/prd.md] — FR21–23, NFR-R2 (clear error state and retry path).
- [Source: _bmad-output/implementation-artifacts/1-4-empty-state-when-there-are-no-tasks.md] — App state routing (loading, empty); useTodos shape; EmptyState pattern for consistency.

---

## Developer Context

### Technical Requirements

- **Stack (this story):** Frontend only. Vite, React 18, TypeScript, Tailwind, TanStack Query. No backend changes.
- **Condition for error state:** `isError === true` from `useTodos()`. Use existing return shape: `data`, `isLoading`, `isError`, `error`, `refetch`. Add branch in App: after loading check, if `isError` render ErrorState with `onRetry={refetch}` and optional message from `error`.
- **Error message:** Prefer API body `message` if present (e.g. from 4xx/5xx JSON `{ code, message }`); otherwise use default "Couldn't load tasks". TanStack Query stores the thrown response or Error in `error`; type may be unknown—safely derive a string for display.
- **Accessibility:** Error message announced via aria-live; Retry button focusable and clearly labeled (visible "Retry" text or aria-label). No state conveyed by color alone (UX-DR7, UX-DR9).

### Architecture Compliance

- **Components:** ErrorState is one of the UX set (TaskList, TaskCard, AddTaskRow, EmptyState, LoadingState, ErrorState). PascalCase file `ErrorState.tsx` in `frontend/src/components/`.
- **State routing:** App (list root) shows exactly one of: LoadingState (when isLoading), ErrorState (when isError), EmptyState (when loaded and data.length === 0), or list (when data.length > 0). Implement the error branch in this story; order of checks: loading → error → empty → list.
- **Naming:** Component name `ErrorState`; no new hooks; reuse `useTodos()` which already exposes isError, error, refetch.

### Library / Framework Requirements

- **TanStack Query:** useTodos already returns `isError`, `error`, `refetch`. Use them for the error branch and pass refetch to ErrorState as onRetry. No API or query key changes.
- **React:** No new dependencies. Use existing Tailwind and React 18. Optional: derive message from `error` (Error or response object) in App and pass to ErrorState.

### File Structure Requirements

- **Must create:** `frontend/src/components/ErrorState.tsx`.
- **Must modify:** `frontend/src/App.tsx` — add branch: when `isError`, render `<ErrorState onRetry={refetch} message={…} />` (or equivalent); ensure error branch is evaluated after loading, before empty/list.
- **Must not create:** TaskCard, TaskList, or other epic-2 components. Do not change backend, `useTodos` queryKey/queryFn, or api/todos.
- **Must preserve:** LoadingState when isLoading; EmptyState when loaded and data.length === 0; list placeholder when data.length > 0; main.tsx, QueryClientProvider, and existing hooks/api.

### Testing Requirements

- **Coverage (AC #1):** Error state visibility when fetch fails, and retry behavior (refetch called), must be covered by unit or integration tests.
- **Placement:** `frontend/src/__tests__/` or co-located (e.g. `ErrorState.test.tsx`, `App.test.tsx`).
- **Approach:** Vitest + React Testing Library. Mock useTodos to return `isError: true`, `refetch: mockRefetch`; render App or ErrorState; assert "Couldn't load tasks" (or passed message), Retry button present and focusable; simulate Retry click and assert refetch was called. Do not require real network.

### Previous Story Intelligence

- **Story 1.4:** App has loading branch (LoadingState) and empty branch (EmptyState when data.length === 0). useTodos is unchanged and already exposes isError, error, refetch. Files touched in 1.4: App.tsx (empty branch), EmptyState.tsx. Reuse same App layout (main, same wrapper) for ErrorState; add error branch between loading and empty.
- **Testing pattern:** Story 1.4 used QueryClientProvider and mocked fetch/useTodos; use same pattern. For error case, mock useTodos to return isError: true and a refetch jest.fn() to assert Retry triggers refetch.
- **Consistency:** ErrorState container/section semantics and padding (e.g. p-8, min-h, flex, gap) should align with EmptyState and LoadingState so layout is consistent across states.

### Latest Tech Information

- **TanStack Query v5:** `isLoading` is true only on initial load; `isError` and `error` are set when queryFn throws or returns a rejected promise. `refetch()` returns a promise and updates state on success/failure. For tests, mocking the hook return values is sufficient.
- **Accessibility:** Use a live region for the error (e.g. `<div role="alert" aria-live="assertive">` or `aria-live="polite"`) so screen readers announce the error when it appears. Retry should be a `<button type="button">` with visible "Retry" text for clarity and accessibility.

### Project Context Reference

- No `project-context.md` in repo. Follow architecture and epics as source of truth. User skill level: intermediate (per config).

---

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

### Completion Notes List

- Task 1: Created `ErrorState.tsx` with message (default "Couldn't load tasks"), onRetry, section layout matching EmptyState/LoadingState (p-8, min-h-[12rem], flex/gap), primary Retry button (bg-blue-600), aria-live="assertive" + role="alert" on message region. Unit tests in ErrorState.test.tsx (7 tests) cover default/custom message, Retry click, focusability, aria-live, section semantics.
- Task 2: App.tsx now destructures isError, error, refetch from useTodos; added getErrorMessage(error) (Error.message or default); error branch after loading, before empty/list; renders ErrorState with message and onRetry={() => refetch()}. No blank screen: only ErrorState shown when isError.
- Task 3: App.test.tsx: added test for fetch failure (500 + body message) showing ErrorState with message and Retry; test for no body message showing default; test for Retry triggering refetch and showing list on success. ErrorState.test.tsx covers component behavior. All 25 frontend tests pass; lint passes.

### File List

- frontend/src/components/ErrorState.tsx (new)
- frontend/src/components/ErrorState.test.tsx (new)
- frontend/src/App.tsx (modified)
- frontend/src/App.test.tsx (modified)

### Change Log

- 2026-03-17: Implemented error state and retry: ErrorState component, App error branch, getErrorMessage, tests for error UI and retry flow.
