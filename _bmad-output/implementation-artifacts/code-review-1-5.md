# Code Review: Story 1.5 — Error state and retry when list fails to load

**Review mode:** Full (spec: story 1.5)  
**Diff:** Uncommitted changes for `App.tsx`, `App.test.tsx`, `ErrorState.tsx`, `ErrorState.test.tsx`  
**Layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor (all completed)

---

## Intent Gaps

None.

---

## Bad Spec

None.

---

## Patch

These are fixable code issues:

1. **Empty string error message not fallback to default**  
   **Location:** `App.tsx` (`getErrorMessage`), `ErrorState.tsx` (message prop)  
   **Detail:** When `error` is an `Error` with `error.message === ""`, `getErrorMessage` returns `""` (falsy so the `error.message` branch is used only when truthy). The object-with-`message` branch uses `msg || DEFAULT_ERROR_MESSAGE`, but the `Error` branch does not. `ErrorState` only uses the default when `message` is `undefined`; passing `message=""` shows an empty string in the aria-live/alert region. Fix: in `getErrorMessage`, treat empty string as default (e.g. `return error.message || DEFAULT_ERROR_MESSAGE` for the Error branch), and/or in `ErrorState` treat `message === ""` as “use default”.

2. **Redundant import**  
   **Location:** `frontend/src/App.test.tsx` (top of file)  
   **Detail:** `fireEvent` is imported on a second line from `@testing-library/react` instead of being added to the existing `render, screen, waitFor` import. Consolidate into one import.

3. **Fragile Response mocks in tests**  
   **Location:** `frontend/src/App.test.tsx` (fetch mock objects)  
   **Detail:** Tests use `as Response` on plain objects that don’t implement the full `Response` contract (e.g. no `headers`, proper `body`). This can hide type/runtime issues. Prefer a small helper or `Response`-like stub that satisfies the actual usage.

4. **Brittle exact string assertion**  
   **Location:** `frontend/src/App.test.tsx` (fetch-failure test)  
   **Detail:** The test expects exact text `'Server error'`. It will break if the UI prefixes or wraps the message (e.g. “Error: Server error”). Prefer a regex or `toHaveTextContent` with a substring.

5. **Weak focusability assertion**  
   **Location:** `frontend/src/App.test.tsx`  
   **Detail:** Asserting `not.toHaveAttribute('tabIndex', '-1')` does not prove the button is focusable (it could be disabled, `inert`, or hidden). Prefer asserting actual focus behavior (e.g. `retryButton.focus(); expect(document.activeElement).toBe(retryButton)`) or document the limitation.

6. **Low-value DOM query for aria-live**  
   **Location:** `frontend/src/App.test.tsx`  
   **Detail:** Using `document.querySelector('[aria-live]')` instead of Testing Library queries (e.g. `getByRole('alert')`) is less maintainable and doesn’t assert the live region’s role or `aria-live` value. Prefer `getByRole('alert', { ... })` or equivalent.

7. **Dense getErrorMessage logic**  
   **Location:** `frontend/src/App.tsx` (`getErrorMessage`)  
   **Detail:** The object-with-`message` check is a long one-liner with repeated casts. Split into variables or multiple lines for readability and maintenance.

8. **Redundant condition in App**  
   **Location:** `frontend/src/App.tsx` (empty-state branch)  
   **Detail:** After the `isLoading` and `isError` branches, the next branch uses `!isLoading && data && ...`. `!isLoading` is always true there; remove it for clarity.

9. **Duplicated default error text**  
   **Location:** `frontend/src/App.tsx`, `frontend/src/components/ErrorState.tsx`  
   **Detail:** The string `"Couldn't load tasks"` appears as `DEFAULT_ERROR_MESSAGE` in App and as the default prop in ErrorState. Use a single shared constant (or one canonical default) to avoid drift.

10. **Redundant live region semantics**  
    **Location:** `frontend/src/components/ErrorState.tsx` (error message div)  
    **Detail:** The error message div has both `role="alert"` and `aria-live="assertive"`. On the same element this can cause duplicate announcements in some screen readers. Prefer one or the other (e.g. `role="alert"` alone, or `aria-live` with a non-alert role if appropriate).

11. **Retry test doesn’t verify refetch was called**  
    **Location:** `frontend/src/App.test.tsx` (Retry → success test)  
    **Detail:** The test only asserts the final UI (“1 task loaded.”). It does not assert that `fetch` (or the query) was called a second time, so it could pass even if Retry didn’t trigger a refetch. Add an assertion that the request count or refetch was invoked after the Retry click.

12. **No handling when refetch() fails on Retry**  
    **Location:** `frontend/src/App.tsx` (`onRetry={() => refetch()}`)  
    **Detail:** If `refetch()` rejects (e.g. network fails again), there is no try/catch or .catch(). TanStack Query will keep `isError` true so the user stays on ErrorState, but an unhandled rejection may surface in the console or error reporting. Consider attaching .catch() or handling retry failure for loading/feedback if desired.

---

## Defer

Pre-existing issues surfaced by this review (not caused by current changes):

1. **fetchTodos can throw Error with empty message**  
   **Location:** `frontend/src/api/todos.ts` (or equivalent `fetchTodos`)  
   **Detail:** When `!res.ok` with `res.statusText === ""` and body missing or `body.message` not a string, the thrown `Error(message)` can have an empty message. That propagates to `getErrorMessage` and can show an empty message in the UI. This is outside the story 1.5 diff; fixing the empty-message fallback in App/ErrorState (patch #1) will mitigate. The API layer can be tightened in a separate change.

---

## Summary

**0** intent_gap, **0** bad_spec, **12** patch, **1** defer, **1** reject (noise).

- **Acceptance Auditor:** No violations of the story 1.5 spec or acceptance criteria.
- **Reject:** One Blind Hunter finding (“ErrorState.test.tsx bodies elided”) was rejected as a false positive; the diff shown to the reviewer had abbreviated test bodies, but the real file contains full implementations.

---

## Next steps

- **Patch:** Address the 12 patch items in a follow-up implementation pass or manually. Prioritize empty-string message fallback (#1) and test robustness (#2–6, #11).
- **Defer:** No action required for this change. The deferred item is noted for future attention (e.g. when touching `api/todos` or error handling).

Workflow complete.
