# Code Review: Story 1.4 — Empty state when there are no tasks

**Reviewed:** 2026-03-17  
**Diff scope:** 4 files (App.tsx, App.test.tsx, EmptyState.tsx, EmptyState.test.tsx)  
**Spec:** 1-4-empty-state-when-there-are-no-tasks.md (full review)

---

## Patch — Fixable code issues

These are fixable code issues:

1. **Empty-state condition does not match spec**  
   **Location:** `frontend/src/App.tsx`  
   Technical requirement: condition must be `!isLoading && data && Array.isArray(data) && data.length === 0`. The code uses `if (data && data.length === 0)` with no `!isLoading` or `Array.isArray(data)` check. Behavior is correct today because the loading branch runs first, but the implementation does not match the spec and would be wrong if branches were reordered or if `data` were ever non-array (e.g. could show "undefined tasks loaded.").  
   **Fix:** Use `if (!isLoading && data && Array.isArray(data) && data.length === 0)`.

2. **Empty-state region not focusable**  
   **Location:** `frontend/src/components/EmptyState.tsx`  
   AC: "The empty state and add affordance are focusable and screen-reader accessible." The add affordance (button) is focusable; the empty-state region is a `<section aria-label="No tasks">` with no `tabIndex`, so it is not in the tab order.  
   **Fix:** Add `tabIndex={0}` to the section so the region is focusable, or clarify in spec that only the add affordance must be focusable.

3. **No test asserting add affordance is focusable**  
   **Location:** `frontend/src/App.test.tsx`, `frontend/src/components/EmptyState.test.tsx`  
   Tests assert presence and accessible name (`getByRole('button', { name: /add your first task/i })`) but do not assert that the control is focusable (e.g. receives focus or is in tab order).  
   **Fix:** Add an assertion that the add button is focusable (e.g. `expect(addButton).not.toHaveAttribute('tabIndex', '-1')` or focus it and assert `document.activeElement`).

4. **EmptyState test uses querySelector; aria-label not asserted**  
   **Location:** `frontend/src/components/EmptyState.test.tsx`  
   Test uses `document.querySelector('section[aria-label], section')` and does not assert the region’s accessible name.  
   **Fix:** Use `screen.getByRole('region', { name: 'No tasks' })` so the test ties to role and label and would fail if `aria-label` were wrong or missing.

5. **Loading test may be flaky**  
   **Location:** `frontend/src/App.test.tsx`  
   "does not show empty state while loading" asserts synchronously after `renderApp()`. If the loading state is set asynchronously (e.g. in a microtask), "Loading tasks" might not be in the document yet.  
   **Fix:** Wrap the assertion in `waitFor(() => expect(screen.getByText('Loading tasks')).toBeInTheDocument())`.

6. **Focus ring should use focus-visible**  
   **Location:** `frontend/src/components/EmptyState.tsx`  
   Button uses `focus:ring-2 focus:ring-offset-2 focus:ring-gray-700`. Using `focus-visible:` instead of `focus:` shows the ring for keyboard focus only, not on mouse click, improving UX.  
   **Fix:** Replace `focus:` with `focus-visible:` for the ring utilities.

7. **Duplicate test coverage**  
   **Location:** `frontend/src/App.test.tsx`  
   "calls fetch with /api/todos URL" and "shows empty state when fetch returns empty array" both mock an empty array and assert "no tasks yet". Intent overlaps.  
   **Fix:** Merge or clarify: e.g. one test for "empty response → empty state + correct API URL", another for "empty state shows CTA and add button".

---

## Defer — Pre-existing or out-of-scope

Pre-existing issues surfaced by this review (not caused by current changes):

1. **Never-resolving promise in loading test** — "does not show empty state while loading" uses a never-resolving promise. `afterEach` calls `vi.unstubAllGlobals()`. If flakiness appears, ensure the fetch mock is fully reset after this test.

2. **No explicit branch for data undefined** — When `!isLoading` and `data` is `undefined`, the app falls through to the default view (no task count). TanStack Query behavior; error state is planned in story 1.5.

3. **useTodos() throws** — No try/catch or Error Boundary around `App`. Uncaught hook/network errors can crash the app. Error handling is story 1.5.

4. **Empty state omits app chrome** — Main list view shows the "aine-training" heading; the empty-state branch does not. Treated as a design choice unless spec or UX requires consistency.

5. **Inconsistent main layout** — Empty-state branch uses `min-h-screen flex flex-col`; default branch adds `items-center justify-center p-8`. Padding and centering differ; defer unless alignment is required.

6. **Focus ring contrast** — `focus:ring-gray-700` on a light background should be verified against WCAG 2.4.7 for focus indicators.

---

## Rejected (noise / spec-compliant)

- **Add button has no behavior** — The "Add your first task" button has no `onClick`. Story 1.4 spec states the add affordance may be a placeholder that does nothing until story 3.2. Rejected as intentional.

---

## Summary

**7** patch, **6** defer, **1** reject. No intent_gap or bad_spec.

Recommendation: Address the 7 patch items in a follow-up pass or manually. The condition in `App.tsx` and the accessibility/test fixes are the highest impact. Deferred items are noted for future work (e.g. story 1.5).
