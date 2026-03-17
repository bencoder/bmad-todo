# Story 1.3: Frontend fetch and loading state

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see a loading state while my task list is being fetched,
so that I know the app is working and not stuck.

## Acceptance Criteria

1. **Given** the frontend is open and the list is being fetched  
   **When** the request is in progress  
   **Then** the UI shows a loading state (spinner or skeleton list)  
   **And** Loading state is announced to assistive tech (e.g. aria-busy or aria-live and "Loading tasks")  
   **And** TanStack Query is used for the fetch; no blank screen while loading  
   **And** The loading state and fetch behavior are covered by unit or integration tests

## Tasks / Subtasks

- [x] **Task 1: API client and types** (AC: #1)
  - [x] Create `frontend/src/api/todos.ts` with a function to fetch todos (GET request to backend); use `VITE_API_URL` + `/api/todos` for base URL
  - [x] Create `frontend/src/types/todo.ts` with `Todo` type matching API shape: `id`, `description`, `completed`, `createdAt` (string, ISO 8601)
  - [x] Ensure fetch uses same origin or configured API URL; handle non-2xx by throwing or returning so TanStack Query can treat as error
- [x] **Task 2: TanStack Query setup and useTodos hook** (AC: #1)
  - [x] Add `@tanstack/react-query` (and optionally `@tanstack/react-query-devtools` for dev); wrap app in `QueryClientProvider` in `main.tsx` or `App.tsx`
  - [x] Create `frontend/src/hooks/useTodos.ts`: use `useQuery` with key `['todos']`, queryFn calling the api fetch; return `{ data, isLoading, isError, error, refetch }` (or equivalent from useQuery)
  - [x] Use TanStack Query's `isLoading` (initial load) so loading is true while fetch is in progress; avoid showing a blank view
- [x] **Task 3: LoadingState component** (AC: #1)
  - [x] Create `frontend/src/components/LoadingState.tsx`: show spinner or skeleton list (e.g. 3–4 placeholder cards); use Tailwind for layout
  - [x] Add `aria-busy="true"` and/or `aria-live="polite"` and accessible text "Loading tasks" (e.g. visually hidden or in a live region) per UX-DR6
  - [x] Component is presentational; receives no required props or optional `message` for consistency with EmptyState/ErrorState
- [x] **Task 4: Wire App to fetch and show loading** (AC: #1)
  - [x] In `App.tsx` (or root list view): call `useTodos()`; while `isLoading` is true, render `LoadingState` only (no blank screen)
  - [x] Do not render empty list or error UI while loading; exactly one of loading / list / empty / error per TaskList state routing (empty and error are stories 1.4 and 1.5; for 1.3 only loading + eventual list or placeholder for next stories)
  - [x] Ensure `VITE_API_URL` is read from `import.meta.env.VITE_API_URL` and passed to API client (or use base URL in one place)
- [x] **Task 5: Tests for loading and fetch** (AC: #1)
  - [x] Unit or integration tests: when useTodos is loading, UI shows LoadingState (or component that renders it); when fetch succeeds, list/data is shown (or placeholder for list UI from story 2.1)
  - [x] Optionally test that fetch is called with correct URL and that loading state is not blank (e.g. contains "Loading" text or aria-busy)
  - [x] Place tests in `frontend/src/__tests__/` or co-located `*.test.tsx`; use Vitest and React Testing Library; mock fetch or MSW for API

## Dev Notes

- **Epic 1 goal:** Runnable app and empty list experience. Story 1.3 delivers the frontend fetch and loading state so the user never sees a blank screen while the list is loading. Stories 1.4 and 1.5 add empty and error states.
- **Story 1.2 baseline:** Backend exposes `GET /api/todos` returning 200 and a JSON array of tasks (camelCase: id, description, completed, createdAt). CORS is enabled. Use this exact endpoint; do not change backend.
- **API contract:** Success = direct array; errors = JSON `{ code, message }` with 4xx/5xx. TanStack Query will treat non-2xx as error; handle in story 1.5 for ErrorState.
- **No list UI yet:** This story does not require rendering actual task cards (that is Epic 2). After loading completes, you may show a simple placeholder (e.g. "Loaded" or a minimal list shell) or defer full list to 1.4/2.1; the AC requires "no blank screen while loading" and tests for loading + fetch behavior.

### Project Structure Notes

- **Frontend (from architecture):** `src/api/todos.ts`, `src/types/todo.ts`, `src/hooks/useTodos.ts`, `src/components/LoadingState.tsx`. App entry: `main.tsx` → `App.tsx`. QueryClientProvider at root.
- **Do not add** EmptyState, ErrorState, TaskCard, or AddTaskRow in this story; only fetch + loading. State routing (show exactly one of loading/empty/error/list) is refined in 1.4 and 1.5.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — Frontend Architecture (TanStack Query, LoadingState), Process Patterns (loading: isLoading, no blank screen), Structure Patterns (api/, hooks/, components/).
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 1, Story 1.3; Additional Requirements (TanStack Query for todos; LoadingState component).
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — UX-DR6 LoadingState: spinner or skeleton, aria-live/aria-busy, "Loading tasks".
- [Source: _bmad-output/implementation-artifacts/1-2-backend-todo-api-and-sqlite-persistence.md] — GET /api/todos contract, camelCase, ISO 8601.

---

## Developer Context

### Technical Requirements

- **Stack (this story):** Frontend only. Vite, React 18, TypeScript, Tailwind. Add TanStack Query (@tanstack/react-query). No backend changes.
- **API:** GET `/api/todos` — base URL from `import.meta.env.VITE_API_URL` (e.g. `http://localhost:3000` in dev). Response: 200 body = array of `{ id, description, completed, createdAt }` (camelCase, createdAt ISO 8601). No `{ data }` wrapper.
- **Loading:** Use TanStack Query's `isLoading` for initial load so the UI shows LoadingState until the first fetch completes. Do not show a blank div or empty view while `isLoading` is true.
- **Env:** Frontend already has `.env.example` with `VITE_API_URL=` from story 1.1; API client must use this for the base URL (with no trailing slash, then append `/api/todos`).

### Architecture Compliance

- **Server state:** TanStack Query only for list fetch; query key `['todos']` per architecture. Naming: `useTodos()` hook returning `{ data, isLoading, isError, error, refetch }` (or useQuery result shape).
- **Components:** LoadingState is one of the UX set (TaskList, TaskCard, AddTaskRow, EmptyState, LoadingState, ErrorState); only LoadingState is implemented in this story. PascalCase file `LoadingState.tsx` in `src/components/`.
- **API client:** Isolate fetch in `src/api/todos.ts`; hooks call this module. No fetch logic in components. Error handling: let TanStack Query receive errors (throw or reject in queryFn) so isError/error are set for story 1.5.
- **Format:** Response is camelCase; TypeScript type `Todo` with `createdAt: string` (ISO 8601). No conversion needed if backend already returns camelCase (story 1.2 does).

### Library / Framework Requirements

- **TanStack Query (React Query):** Install `@tanstack/react-query`. Create a `QueryClient` and wrap the app with `QueryClientProvider`. Use `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` (or equivalent). Use `isLoading` for initial load; avoid blank screen when loading is true.
- **Fetch:** Use native `fetch` in the API module, or a thin wrapper. Build full URL from `import.meta.env.VITE_API_URL` + `/api/todos`. Do not add axios or other HTTP client unless already in project; keep minimal.
- **React:** No new React version required; existing React 18 and Vite setup from story 1.1 are sufficient.

### File Structure Requirements

- **Must create:**  
  `frontend/src/api/todos.ts`, `frontend/src/types/todo.ts`, `frontend/src/hooks/useTodos.ts`, `frontend/src/components/LoadingState.tsx`.  
  Add `QueryClientProvider` in `main.tsx` or `App.tsx` (wrap existing tree).
- **Must not create:** EmptyState, ErrorState, TaskCard, TaskList container, AddTaskRow (stories 1.4, 1.5, 2.x). Do not add backend routes or change backend.
- **Must preserve:** Existing `App.tsx`, `main.tsx`, Vite and Tailwind config, and backend GET /api/todos behavior. Frontend may show only LoadingState then a simple placeholder after load (e.g. "Loaded" or minimal div) until story 1.4/2.1 add empty/list UI.

### Testing Requirements

- **Coverage (AC #1):** Loading state and fetch behavior must be covered by unit or integration tests.
- **Placement:** `frontend/src/__tests__/` or co-located (e.g. `useTodos.test.ts`, `LoadingState.test.tsx`, or `App.test.tsx`).
- **Approach:** Use Vitest and React Testing Library. Mock the API (global fetch or MSW): when fetch is pending, assert LoadingState is rendered (e.g. "Loading tasks" text or aria-busy); when fetch resolves with array, assert loading is gone and data is used (or placeholder). Do not require full TaskCard rendering; focus on loading vs loaded state and correct fetch URL.

### Previous Story Intelligence

- **Story 1.1:** Frontend has Vite + React + TypeScript, Tailwind, Vitest, Playwright, `main.tsx`, `App.tsx`, `.env.example` with `VITE_API_URL=`. No api/ or hooks/ yet. Do not remove or break existing scripts or Docker setup.
- **Story 1.2:** Backend has GET /api/todos returning 200 and JSON array; task shape id, description, completed, createdAt (camelCase, ISO 8601); errors are `{ code, message }`. CORS allows frontend origin. Use exactly `/api/todos`; no trailing slash on base URL. Tests use Fastify inject; frontend will call real backend in dev or use env for URL.
- **File layout:** Backend has `src/app.ts`, `src/routes/todos.ts`, `src/db/`, `src/schemas/todos.schema.ts`. Frontend has `src/App.tsx`, `src/main.tsx`, `src/index.css`; add api/, types/, hooks/, and LoadingState without changing existing component names. Do not add TaskList or other state components yet.

### Latest Tech Information

- **TanStack Query v5:** Use `useQuery` from `@tanstack/react-query`. `isLoading` is true only for the initial load when there is no data yet; `isFetching` is true for any fetch including refetch. For "no blank screen while loading", use `isLoading` to show LoadingState on first load.
- **Vite env:** `import.meta.env.VITE_API_URL` is the correct way to read the API base URL; ensure it is set in dev (e.g. in `.env` or docker-compose env) so the frontend can reach the backend.

### Project Context Reference

- No `project-context.md` in repo. Follow architecture and epics as source of truth. User skill level: intermediate (per config).

---

## Dev Agent Record

### Agent Model Used

(Cursor / Auto)

### Debug Log References

### Completion Notes List

- Task 1: Added `frontend/src/types/todo.ts` (Todo interface) and `frontend/src/api/todos.ts` (fetchTodos using VITE_API_URL + /api/todos, throws on non-2xx). Unit tests in `api/todos.test.ts` for URL, 200 response, and error throw.
- Task 2: Installed @tanstack/react-query and @tanstack/react-query-devtools. Wrapped app in QueryClientProvider in main.tsx; added ReactQueryDevtools. Created useTodos hook with queryKey ['todos'], queryFn fetchTodos, returning data, isLoading, isError, error, refetch.
- Task 3: Created LoadingState.tsx with Tailwind spinner, aria-busy="true", aria-live="polite", aria-label and sr-only "Loading tasks", optional message prop.
- Task 4: App.tsx uses useTodos(); when isLoading renders LoadingState only; when loaded shows placeholder (title + task count if any). No EmptyState/ErrorState. VITE_API_URL used in api/todos.ts.
- Task 5: App.test.tsx (with QueryClientProvider) tests loading state shows "Loading tasks" and aria-busy, success shows content and fetch URL. LoadingState.test.tsx for aria and message. All 9 tests pass; lint clean.

### File List

- frontend/package.json (modified – added @tanstack/react-query, @tanstack/react-query-devtools)
- frontend/src/types/todo.ts (new)
- frontend/src/api/todos.ts (new)
- frontend/src/api/todos.test.ts (new)
- frontend/src/hooks/useTodos.ts (new)
- frontend/src/components/LoadingState.tsx (new)
- frontend/src/components/LoadingState.test.tsx (new)
- frontend/src/main.tsx (modified – QueryClientProvider, ReactQueryDevtools)
- frontend/src/App.tsx (modified – useTodos, LoadingState when loading, placeholder when loaded)
- frontend/src/App.test.tsx (modified – QueryClientProvider wrapper, loading/success/fetch URL tests)

### Change Log

- 2026-03-17: Story 1.3 implemented – frontend fetch and loading state (API client, TanStack Query, LoadingState, App wiring, tests).
