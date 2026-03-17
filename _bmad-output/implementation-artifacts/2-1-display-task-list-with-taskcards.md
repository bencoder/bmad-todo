# Story 2.1: Display task list with TaskCards

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see my tasks in a list with completed vs active clearly distinguished and creation time visible,
so that I can scan my list and know what is done and when I added each task.

## Acceptance Criteria

1. **Given** `GET /api/todos` returns one or more tasks  
   **When** the frontend has loaded the list  
   **Then** each task is shown in a card (Direction C: light background, border, rounded corners, padding) with a checkbox, description, and creation time  
   **And** Completed tasks are visually distinct (e.g. strikethrough and muted color); active tasks are primary  
   **And** The list uses semantic list markup (e.g. role="list") and a max-width container with padding; cards have a gap between them  
   **And** List is visible with no blocking delay after open (NFR-P1)  
   **And** Task list display and TaskCard rendering are covered by unit or integration tests  

## Tasks / Subtasks

- [x] **Task 1: TaskCard component** (AC: #1)
  - [x] Create `frontend/src/components/TaskCard.tsx`: accepts `todo: Todo`; renders a card (Direction C: background #fafafa or surface token, border 1px #eee, border-radius 8px, padding 14px 16px) with checkbox, description, and creation time
  - [x] Checkbox: reflects `todo.completed` (checked/unchecked); in this story display-only (no onToggle; Epic 4 adds toggle). Use semantic `<input type="checkbox" checked={todo.completed} readOnly />` with label or aria-label for accessibility
  - [x] Description: show `todo.description`; when `todo.completed` apply strikethrough (line-through) and muted text color (e.g. text-gray-500)
  - [x] Creation time: format `todo.createdAt` (ISO 8601) for display (e.g. localized date or "Mar 17, 2026"); use secondary/muted styling (e.g. text-sm text-gray-500)
  - [x] Use Tailwind; match Direction C from ux-design-directions.html (gap 12px between checkbox, text, time; flex layout)
  - [x] Do not add delete or edit controls in this story (Epic 4/5)
- [x] **Task 2: List container and render tasks in App** (AC: #1)
  - [x] In `App.tsx`: when `data` exists and has length > 0, replace the current placeholder ("Todo list (loaded)...") with a list container: max-width (e.g. 560px), padding (e.g. p-6 or p-8), centered (mx-auto)
  - [x] Render a list: `<ul role="list">` or equivalent with semantic list items; map `data` to `<TaskCard key={todo.id} todo={todo} />`; use `gap` between cards (e.g. gap-2 or gap-3, 8px per Direction C)
  - [x] Keep existing branches: loading → LoadingState; isError → ErrorState; empty → EmptyState; then list of TaskCards. No blocking delay: list renders as soon as data is available (TanStack Query already handles this)
- [x] **Task 3: Tests for TaskCard and list display** (AC: #1)
  - [x] Unit tests for TaskCard: renders description and creation time; shows completed state (strikethrough, muted) when todo.completed is true; shows unchecked/checked checkbox; uses card layout (Direction C classes)
  - [x] Integration/App test: when useTodos returns data with one or more tasks, App renders list with TaskCards; list container has max-width and semantic list markup; assert at least one task description and creation time visible
  - [x] Place tests in `frontend/src/__tests__/` or co-located (e.g. TaskCard.test.tsx); use Vitest and React Testing Library

## Dev Notes

- **Epic 2 goal:** View persisted task list — user sees saved tasks with completed vs active distinguished and creation time visible; list appears with no blocking delay; data persists across refresh/sessions (FR2, FR3, FR4, FR15, FR16).
- **Story 2.1 scope:** Introduce TaskCard and display the list of tasks in cards. Story 2.2 will introduce TaskList component and centralize state routing (loading/empty/error/list) and add AddTaskRow at top; this story focuses on "what a task looks like" and "list of TaskCards."
- **Checkbox in 2.1:** Display-only (readOnly) so we don't need PATCH or mutation hooks yet. Epic 4 (Story 4.1) adds complete-task API and checkbox toggle behavior.
- **Creation time format:** Use a small formatter (e.g. `new Date(createdAt).toLocaleDateString()` or similar); keep timezone handling simple for v1 (user's locale is fine).

### Project Structure Notes

- **Frontend (from architecture):** `src/components/TaskCard.tsx`; App currently has four branches (loading, error, empty, list placeholder). Replace list placeholder with list container + TaskCards. Do not add TaskList wrapper component in this story (that is 2.2); do not add AddTaskRow (Epic 3).
- **Todo type:** `frontend/src/types/todo.ts` already has `Todo` with `id`, `description`, `completed`, `createdAt`; use it for TaskCard props.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — TaskCard in component set; Direction C; naming PascalCase; structure frontend/src/components/.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 2, Story 2.1; FR2, FR3, FR4; acceptance criteria.
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — UX-DR3 TaskCard anatomy (checkbox, label, Direction C card); UX-DR8 Direction C; strikethrough and muted for completed.
- [Source: _bmad-output/planning-artifacts/ux-design-directions.html] — Direction C: `.dir-c li { background: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 14px 16px; }`; gap 8px between cards; gap 12px inside card.
- [Source: _bmad-output/implementation-artifacts/1-5-error-state-and-retry-when-list-fails-to-load.md] — App state order (loading → error → empty → list); useTodos shape; main wrapper pattern.

---

## Developer Context

### Technical Requirements

- **Stack (this story):** Frontend only. Vite, React 18, TypeScript, Tailwind, TanStack Query. No backend or API changes.
- **Data:** `useTodos()` already returns `data: Todo[]` when successful. Each `Todo` has `id`, `description`, `completed`, `createdAt` (ISO 8601 string). Use `data` in App to render list of TaskCards.
- **Direction C card (from ux-design-directions.html):** Card: `background: #fafafa`, `border: 1px solid #eee`, `border-radius: 8px`, `padding: 14px 16px`. List: `display: flex; flex-direction: column; gap: 8px`. Inner card layout: flex, gap 12px, align-items center.
- **Semantic list:** Use `<ul role="list">` and `<li>` (or role="listitem") for the list of cards so screen readers get list structure (UX-DR4, NFR-A1).
- **Creation time:** Format `createdAt` for display (e.g. `toLocaleDateString()` or short format); keep secondary/muted so it doesn't compete with description.

### Architecture Compliance

- **Components:** TaskCard is one of the UX set (TaskList, TaskCard, AddTaskRow, EmptyState, LoadingState, ErrorState). PascalCase file `TaskCard.tsx` in `frontend/src/components/`.
- **Naming:** Component `TaskCard`; prop `todo: Todo`. No new hooks; reuse `useTodos()`.
- **State routing:** App already shows exactly one of loading / error / empty / list. This story only changes the "list" branch from placeholder to real list of TaskCards; do not change order of branches.

### Library / Framework Requirements

- **React:** No new dependencies. Use existing Tailwind and React 18. Type TaskCard props with `Todo` from `src/types/todo.ts`.
- **TanStack Query:** No changes to useTodos or query key; data shape unchanged.

### File Structure Requirements

- **Must create:** `frontend/src/components/TaskCard.tsx`.
- **Must modify:** `frontend/src/App.tsx` — replace the list placeholder (current "Todo list (loaded). Full list UI..." branch) with a max-width container and `<ul>` of `<TaskCard key={todo.id} todo={todo} />` with gap between items.
- **Must not create:** TaskList component (Story 2.2), AddTaskRow (Epic 3), delete/edit controls (Epic 4/5). Do not change backend, useTodos, or api/todos.
- **Must preserve:** LoadingState, ErrorState, EmptyState branches and main wrapper; QueryClientProvider and existing hooks.

### Testing Requirements

- **Coverage (AC #1):** Task list display and TaskCard rendering must be covered by unit or integration tests.
- **TaskCard tests:** Render with todo (description, completed, createdAt); assert completed styling (strikethrough, muted); assert checkbox checked when completed; assert card has Direction C–like classes (padding, rounded, border).
- **App/list test:** When data has one or more tasks, assert list container present, role="list" or ul, and at least one task description and formatted creation time visible.
- **Placement:** `frontend/src/__tests__/TaskCard.test.tsx` or `TaskCard.test.tsx` beside component; extend App.test.tsx for list branch. Use Vitest and React Testing Library; mock useTodos or fetch as in existing App tests.

### Previous Story Intelligence

- **Story 1.5:** App has loading → error → empty → list branches; useTodos returns data, isLoading, isError, error, refetch. List branch currently shows a placeholder with "X task(s) loaded." Replace that branch only; do not touch ErrorState, LoadingState, EmptyState, or getErrorMessage. Main wrapper is `<main className="min-h-screen flex flex-col">`; keep same pattern for list branch (e.g. add items-center or a wrapper div for the list container).
- **Testing pattern:** App tests use QueryClientProvider, mock fetch, waitFor for async; use same pattern. For TaskCard, render with a fixture Todo object.
- **Consistency:** Direction C card styling (p-4 or px-4 py-3.5, rounded-lg, border, bg-gray-50 or #fafafa) should match EmptyState/LoadingState/ErrorState use of section/layout where relevant (same design language).

### Latest Tech Information

- **Date formatting:** `new Date(isoString).toLocaleDateString(undefined, { dateStyle: 'medium' })` gives locale-aware date (e.g. "Mar 17, 2026"). Optional: `toLocaleString` for date+time if product prefers.
- **Semantic list:** `<ul role="list">` with `list-style: none` (Tailwind `list-none`) is valid when list semantics are desired but bullets not; or use plain `<ul>` and style as needed. Ensure each card is in an `<li>` for listitem semantics.

### Project Context Reference

- No `project-context.md` in repo. Follow architecture and epics as source of truth. User skill level: intermediate (per config).

---

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

### Completion Notes List

- Task 1: Created TaskCard.tsx with Direction C styling (#fafafa, border #eee, rounded-lg, px-4 py-3.5), readOnly checkbox with aria-label, description with line-through/text-gray-500 when completed, formatted createdAt via toLocaleDateString(undefined, { dateStyle: 'medium' }). Flex layout gap-3.
- Task 2: Replaced list placeholder in App.tsx with max-w-[560px] container, `<ul role="list">` with list-none gap-2, mapping data to TaskCard; preserved loading/error/empty branches.
- Task 3: Added TaskCard.test.tsx (6 tests: description/time, completed styling, checkbox states, card layout classes, readOnly). Updated App.test.tsx: list branch asserts role="list", task description, time element, and max-width container; added test for multiple TaskCards.

### File List

- frontend/src/components/TaskCard.tsx (new)
- frontend/src/components/TaskCard.test.tsx (new)
- frontend/src/App.tsx (modified)
- frontend/src/App.test.tsx (modified)

### Change Log

- 2026-03-17: Implemented TaskCard component (Direction C), list container and TaskCard list in App, unit and integration tests. All AC satisfied; story ready for review.
