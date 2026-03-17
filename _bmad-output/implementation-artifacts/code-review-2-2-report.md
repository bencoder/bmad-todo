# Code Review Report: Story 2.2 — TaskList container and state routing

**Review date:** 2026-03-17  
**Diff source:** Uncommitted changes (story 2.2 file list)  
**Spec:** `2-2-tasklist-container-and-state-routing.md`  
**Review mode:** full (Acceptance Auditor ran)

---

## Summary

**0** intent_gap, **0** bad_spec, **8** patch, **1** defer findings. **1** finding rejected as noise.

---

## Patch — Fixable code issues

These can be addressed in a follow-up implementation pass or manually.

1. **AddTaskRow always passes empty string to onSubmit**  
   **Source:** blind+edge  
   **Location:** `frontend/src/components/AddTaskRow.tsx` (handleSubmit)  
   **Detail:** `handleSubmit` calls `onSubmit?.('')` and never reads the input value; the input is uncontrolled. When Epic 3 Story 3.2 wires submit, callers will receive an empty string. Either pass the input value (e.g. via ref or controlled state) to `onSubmit`, or document in JSDoc that the callback receives `''` until 3.2.

2. **Test does not assert value passed to onSubmit**  
   **Source:** blind  
   **Location:** `frontend/src/components/AddTaskRow.test.tsx` (onSubmit test)  
   **Detail:** The test only asserts `onSubmit` was called, not the argument. The implementation can pass `''` and the test still passes. Add an assertion such as `expect(onSubmit).toHaveBeenCalledWith(expect.any(String))` or assert the actual input value once AddTaskRow passes it.

3. **Retry failures silently swallowed**  
   **Source:** blind+edge  
   **Location:** `frontend/src/components/TaskList.tsx` (onRetry)  
   **Detail:** `onRetry={() => refetch().catch(() => {})}` swallows refetch errors. If the server stays down or the request keeps failing, the user gets no feedback. In the `.catch`, surface a failure state (e.g. "Retry failed" message or toast) or at least log; avoid a silent no-op.

4. **getErrorMessage edge cases**  
   **Source:** blind+edge  
   **Location:** `frontend/src/components/TaskList.tsx` (getErrorMessage)  
   **Detail:** (a) When `error instanceof Error` and the message is non-empty, the code returns `error.message` instead of the trimmed `msg`, so leading/trailing whitespace can be returned. (b) When `error` is a string, the helper falls through to `DEFAULT_ERROR_MESSAGE` and the actual message is lost. Return the trimmed value in the Error branch and add a branch: `if (typeof error === 'string') { const t = error.trim(); return t || DEFAULT_ERROR_MESSAGE; }`.

5. **AddTaskRow test: form from closest('form') can be null**  
   **Source:** edge  
   **Location:** `frontend/src/components/AddTaskRow.test.tsx`  
   **Detail:** The test uses `screen.getByRole('textbox', ...).closest('form')` then `fireEvent.submit(form!)`. If the DOM structure changes, `form` can be null and the test will throw. Prefer `expect(form).not.toBeNull()` before submit or use `screen.getByRole('form')` so the test fails clearly if the form is missing.

6. **No test for refetch rejection**  
   **Source:** edge  
   **Location:** `frontend/src/components/TaskList.test.tsx`  
   **Detail:** The ErrorState test uses `refetch = vi.fn(() => Promise.resolve())`. The real code uses `refetch().catch(() => {})`; there is no test that a rejecting refetch doesn’t break the UI. Add a test where `refetch` returns a rejected promise and assert the component does not throw (and, if retry-failure UX is added, that it is shown).

7. **isLoading && isError ordering undocumented**  
   **Source:** edge  
   **Location:** `frontend/src/components/TaskList.tsx`  
   **Detail:** When both `isLoading` and `isError` are true (e.g. during refetch-after-error), the current order shows LoadingState. This is acceptable but intentional behavior is undocumented. Add a short comment that loading takes precedence when both are true.

---

## Defer — Pre-existing issues (not caused by this change)

1. **data shape not validated for list items**  
   **Source:** edge  
   **Location:** `frontend/src/components/TaskList.tsx` (list branch)  
   **Detail:** There is no runtime check that `data` items have `id` or other expected fields; malformed or partial API responses could cause runtime errors or odd UI in TaskCard. The spec and architecture assume the API contract is trusted; this is noted for future attention if the API contract changes or validation is introduced.

---

## Rejected (noise)

- **Redundant `role="list"` on `<ul>`** — `<ul>` already has an implicit `role="list"`. Harmless; no action required.

---

## Acceptance audit

The Acceptance Auditor reported **no violations** of Story 2.2 acceptance criteria or spec. State routing order, AddTaskRow placement, test coverage for loading/error/empty/list, and App structure (main + TaskList) all match the spec.
