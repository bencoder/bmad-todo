# Code Review Report: Story 2-1 (Display task list with TaskCards)

**Review date:** 2026-03-17  
**Diff source:** Uncommitted changes (story 2-1 files)  
**Spec:** `2-1-display-task-list-with-taskcards.md`  
**Review mode:** full  
**Layers run:** Blind Hunter, Edge Case Hunter, Acceptance Auditor

---

## Intent Gaps

*None.*

---

## Bad Spec

*None.*

---

## Patch (fixable code issues)

1. **Success branch renders empty list when `data` is undefined**  
   **Location:** `App.tsx` (list return branch, ~54–59)  
   **Detail:** The final return always renders the list container and `<ul>`. If `data` is undefined (e.g. TanStack Query not yet populated), `data?.map(...)` yields nothing and an empty list is shown instead of empty state or a safe fallback.  
   **Suggestion:** Guard: e.g. `if (!data || !Array.isArray(data)) return <EmptyState />` (or null) before rendering the list.

2. **Invalid or missing `createdAt` shows "Invalid Date"**  
   **Location:** `TaskCard.tsx` (formatCreatedAt / time display)  
   **Detail:** `new Date(createdAt).toLocaleDateString(...)` can produce "Invalid Date" if `createdAt` is undefined, null, or an invalid ISO string.  
   **Suggestion:** Validate before formatting, e.g. `if (!createdAt || isNaN(new Date(createdAt).getTime())) return '—'` (or similar fallback).

3. **`todo.description` null/undefined renders as text**  
   **Location:** `TaskCard.tsx` (description span)  
   **Detail:** If the API omits `description` or sends null, the UI can show "null" or "undefined".  
   **Suggestion:** Use `{todo.description ?? ''}` (or a placeholder like "—").

4. **Unsafe or duplicate `todo.id` in list key**  
   **Location:** `App.tsx` (map over `data`)  
   **Detail:** If `todo.id` is undefined or duplicated, React key warnings or reconciliation issues can occur.  
   **Suggestion:** Use a fallback key, e.g. `key={todo.id ?? index}` with index from map (or ensure API always sends unique ids).

5. **`todo.completed` undefined can mis-set checkbox**  
   **Location:** `TaskCard.tsx` (checkbox `checked`)  
   **Detail:** `checked={todo.completed}` is false for undefined, but the spec implies a boolean. Explicit coercion avoids ambiguity if the API omits the field.  
   **Suggestion:** `checked={Boolean(todo.completed)}`.

---

## Defer (pre-existing, not caused by this change)

These were raised by the Blind Hunter and Edge Case Hunter but refer to code outside the story 2-1 diff (ErrorState, refetch, getErrorMessage, existing tests):

1. Unhandled refetch rejection / refetch can throw — Retry handler does not catch rejection; no feedback if retry fails.
2. No loading or disabled state on Retry button — Users can click Retry repeatedly with no in-flight indication.
3. Error message rendered unsanitized — Risk of XSS if message ever contains HTML/script.
4. Empty or whitespace error message not normalized to default — Empty string can show blank instead of default message.
5. Redundant `!isLoading` in empty check — Logic noise (branch order already implies !isLoading).
6. Duplicate live region semantics — Both `aria-live="assertive"` and `role="alert"` on same element.
7. No focus management when switching to error state — Focus not moved to error or Retry button.
8. Retry test uses fireEvent instead of userEvent — Prefer userEvent for realism.
9. No test for refetch failure — "Retry failed again" behavior untested.
10. No test for empty/whitespace error message — Default-message normalization untested.
11. getErrorMessage does not handle all API error shapes — e.g. nested response message.
12. Error view has no heading — Missing heading for outline/accessibility.

---

## Summary

**0** intent_gap, **0** bad_spec, **5** patch, **12** defer. **0** findings rejected as noise.

Acceptance Auditor reported no spec violations; the implementation matches Story 2.1 acceptance criteria and constraints. The patch items are defensive improvements within the changed files; the defer items are noted for future work (e.g. error/retry UX and tests).

---

## Next steps

- **Patch:** Address the 5 patch items in a follow-up implementation pass or manually.
- **Defer:** No action required for this change; deferred items are logged for later consideration.
