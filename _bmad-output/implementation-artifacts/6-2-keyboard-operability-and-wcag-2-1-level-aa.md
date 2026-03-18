# Story 6.2: Keyboard operability and WCAG 2.1 Level AA

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to use the app with the keyboard and have clear focus and semantics,
so that I can add, complete, edit, delete, and retry without a mouse and with assistive tech.

## Acceptance Criteria

1. **Given** the app is open  
   **When** I use only the keyboard  
   **Then** I can focus and activate add input, Add button, each task's checkbox, label/edit, delete, and Retry  
   **And** Tab order is logical (e.g. add input → Add → tasks in order); focus is visible (e.g. 2px outline) on all interactive elements  

2. **Given** the app is open  
   **When** I rely on semantics and non-color cues  
   **Then** Semantic markup is used (form, list, listitem, button, label); completed and error states are not conveyed by color alone (strikethrough, icon, or text)  

3. **Given** the app is open  
   **When** I view text and UI  
   **Then** Contrast meets WCAG 2.1 AA (4.5:1 normal text, 3:1 large text and UI); the interface is self-explanatory (FR25, FR26, NFR-A1, UX-DR9)

## Tasks / Subtasks

- [x] **Task 1: Keyboard focus order and focusability** (AC: #1)
  - [x] Verify tab order: add-task input → Add button → for each task: checkbox → edit label/input → delete button → next task. No positive tabIndex; no focusable non-interactive elements (e.g. ensure `<time>` is not in tab order if it ever becomes focusable).
  - [x] Ensure every interactive element is focusable by keyboard: AddTaskRow input and Add button, each TaskCard checkbox, edit trigger/input, delete button, ErrorState Retry, EmptyState add affordance (if it contains a focusable control).
  - [x] Add or fix focus-visible styles so focus is visible (2px outline or ring) on all interactive elements. Prefer `focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2` (or equivalent) so focus ring shows for keyboard, not on mouse click only.
- [x] **Task 2: Focus-visible on checkbox and delete** (AC: #1)
  - [x] TaskCard checkbox: add visible focus style (e.g. `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring` or ring) so keyboard focus is clearly visible.
  - [x] TaskCard delete button: replace `focus:ring-2` with `focus-visible:ring-2` (and keep ring color/offset) so focus ring appears on keyboard focus, not on mouse click, and is consistently 2px visible.
- [x] **Task 3: Semantic markup audit** (AC: #2)
  - [x] Confirm AddTaskRow uses `<form>` with associated `<label>` (visible or sr-only) for the add input; Add is `<button type="submit">`.
  - [x] Confirm TaskList uses `<ul role="list">` and each TaskCard renders as `<li>` so list and listitem semantics are correct.
  - [x] Confirm TaskCard: checkbox has aria-label; edit trigger is `<button>` with aria-label; delete is `<button>` with aria-label "Delete task"; inline edit input has aria-label and aria-invalid/aria-describedby when error.
  - [x] Confirm completed state: strikethrough + muted text (already in place); error state: role="alert" and text (already in place). No state conveyed by color alone.
- [x] **Task 4: Keyboard actions** (AC: #1)
  - [x] Add: Enter in add input submits (form submit); Add button Enter activates submit. No change if already working.
  - [x] Complete: Space on checkbox toggles completion (native behavior). Ensure checkbox is not readOnly when onToggleComplete is provided so Space works.
  - [x] Edit: Enter or click on edit trigger (button) starts edit; Enter in edit input saves; Escape cancels edit (already in handleKeyDown). Ensure edit trigger is a button so Enter activates it.
  - [x] Delete: Focus delete button, Enter or Space activates (native button). No extra confirmation required for MVP.
  - [x] Retry: Focus Retry button, Enter or Space activates (native button).
- [x] **Task 5: Contrast and WCAG 2.1 AA verification** (AC: #3)
  - [x] Verify design tokens used in UI meet WCAG 2.1 AA: normal text (e.g. text-primary on background/surface) ≥ 4.5:1; large text (e.g. 18px+ or 14px bold) and UI components ≥ 3:1. Primary button (primary on white/surface), focus-ring, error text, and text-muted on background should be checked.
  - [x] Document or add a short comment in code/tests that contrast was verified (e.g. primary #1e40af on #fafafa, text-primary #1a1a1a on #f5f5f5). If any token fails, adjust token value in tailwind.config.js and ensure no hardcoded colors bypass tokens.
  - [x] Ensure focus indicator has at least 3:1 contrast against background (focus-ring token or outline).
- [x] **Task 6: Optional focus management** (AC: #1 – quality)
  - [x] After adding a task: focus can remain in add input (current behavior) or move to the new task's checkbox per team preference; document choice. No requirement to move focus for MVP.
  - [x] After deleting a task: consider moving focus to next task's checkbox or to add input to avoid focus loss; implement if simple and not fragile.
- [x] **Task 7: E2E and unit tests for keyboard and semantics** (AC: #1, #2, #3)
  - [x] Add or extend E2E tests: tab through Add input → Add → first task checkbox → edit → delete (and Retry when in error state); assert focus is visible (e.g. check for focus-visible ring or document.activeElement).
  - [x] Unit/component tests: ensure checkbox, edit button, delete button, Retry button are focusable and have expected aria-labels and roles; ensure list is role="list" and items are `<li>`.

## Dev Notes

- **Epic 6 goal:** Accessibility, responsiveness, and quality (FR24–FR28). Story 6.1 established design tokens and Direction C. This story delivers keyboard operability and WCAG 2.1 Level AA for the task list and all core actions (add, complete, edit, delete, retry).
- **Current state:** AddTaskRow has form, label, aria-labels, focus-visible ring on input and Add button. TaskCard uses `<li>`, checkbox with aria-label, edit as button with aria-label, delete as button with aria-label "Delete task", inline edit with Enter/Escape; strikethrough + muted for completed; role="alert" for errors. TaskList uses `<ul role="list">`. ErrorState and LoadingState have aria-busy/aria-live/aria-label; Retry has focus ring. Gaps: (1) checkbox may lack visible focus style; (2) delete button uses `focus:ring` instead of `focus-visible:ring`; (3) tab order and contrast need explicit verification; (4) no E2E coverage for keyboard flow.
- **Reference:** UX-DR9 (WCAG 2.1 AA: contrast, focus, labels, semantics, keyboard); NFR-A1; FR24 (keyboard), FR25 (self-explanatory), FR26 (WCAG 2.1 AA). UX spec Component Strategy: Tab order add input → Add → checkbox → label/edit → delete; Space toggles complete; Enter saves edit; Escape cancels edit.

### Project Structure Notes

- **Components to modify:** `TaskCard.tsx` (checkbox focus-visible, delete button focus-visible), optionally `AddTaskRow.tsx` / `ErrorState.tsx` / `EmptyState.tsx` if focus or semantics need tweaks. `TaskList.tsx`: confirm structure (ul/li) only.
- **Config:** `tailwind.config.js` — only change if contrast audit requires token value updates.
- **Tests:** `frontend/e2e/` — add or extend keyboard/semantics E2E; `frontend/src/components/*.test.tsx` — assert focusability and ARIA.
- **No backend changes.**

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Accessibility Strategy (WCAG 2.1 AA, contrast, keyboard, focus, semantics); Component Strategy (AddTaskRow, TaskCard, TaskList, ErrorState, LoadingState); UX-DR9, UX-DR10.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 6, Story 6.2; AC: keyboard focus/activate, tab order, focus visible, semantic markup, non-color state, contrast, self-explanatory.
- [Source: _bmad-output/planning-artifacts/architecture.md] — NFR-A1; frontend structure; Tailwind + design tokens; component names and patterns.

---

## Developer Context

### Technical Requirements

- **Keyboard operability:** All core actions (add, complete, edit, delete, retry) must be achievable with keyboard only. Tab order: add input → Add button → for each task in list order: checkbox → edit trigger/input → delete button. No positive tabIndex. Use native form submit (Enter in input), native button activation (Enter/Space), native checkbox (Space toggles). Edit: Enter on edit button starts edit; Enter in edit input saves; Escape cancels.
- **Focus visible:** Every interactive element must show a visible focus indicator (2px outline or ring) when focused via keyboard. Use `focus-visible:` so the indicator shows for keyboard focus, not necessarily on mouse click. Tailwind: `focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2` (or `focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2` for checkbox if ring is awkward).
- **Semantic markup:** Form for add (form, label, input, button type="submit"). List: ul with role="list", li for each task. Buttons for edit trigger and delete (not divs with onClick). Labels: visible or sr-only; aria-label for icon-only or redundant label. Completed: strikethrough + muted (not color alone). Error: role="alert" + text (already present).
- **Contrast (WCAG 2.1 AA):** Normal text ≥ 4.5:1 against background; large text and UI ≥ 3:1. Verify tokens in tailwind.config.js (text-primary, text-secondary, text-muted, primary, focus-ring, error on background/surface). Focus indicator ≥ 3:1 against background.

### Architecture Compliance

- **Naming and structure:** No new components; modify existing TaskCard, TaskList, AddTaskRow, ErrorState, EmptyState, LoadingState only. Follow existing PascalCase and file locations.
- **Patterns:** Use Tailwind utility classes for focus-visible and contrast; no new design system. Keep API and backend unchanged.
- **UX alignment:** UX-DR9 (WCAG 2.1 AA), NFR-A1, FR24–FR26. Tab order and keyboard behavior per UX spec Component Strategy and Accessibility Strategy.

### Library / Framework Requirements

- **Tailwind CSS:** Use existing focus-visible and ring utilities; ensure focus-ring token is used for consistency. No new dependencies.
- **React:** Use native elements (form, input, button, ul, li); avoid div+onClick for actions. Ref and focus management only where needed (e.g. focus in edit input when entering edit mode — already implemented).

### File Structure Requirements

- **Modify:** `frontend/src/components/TaskCard.tsx` (checkbox focus-visible, delete button focus-visible), optionally `frontend/src/components/AddTaskRow.tsx`, `ErrorState.tsx`, `EmptyState.tsx` if audit finds issues. `frontend/tailwind.config.js` only if contrast values need adjustment.
- **Tests:** `frontend/e2e/tasks.spec.ts` or new `frontend/e2e/accessibility.spec.ts` for keyboard tab order and focus; `frontend/src/components/TaskCard.test.tsx`, `AddTaskRow.test.tsx`, `ErrorState.test.tsx` for focusability and ARIA.
- **Do not create** new components or backend routes.

### Testing Requirements

- **E2E:** Tab through full flow (add input → Add → task checkbox → edit → delete); assert focus visible and no keyboard traps. Optional: test Retry in error state.
- **Unit/component:** Interactive elements are focusable (not tabIndex="-1" unless intended); have correct aria-labels and roles; list has role="list", items are li.
- **Manual:** Run with keyboard only (no mouse); use one screen reader (e.g. VoiceOver or NVDA) for add, complete, edit, delete, retry. Optional: axe or Lighthouse accessibility audit.
- **Regression:** Existing E2E (tasks.spec.ts, smoke.spec.ts) and unit tests must still pass.

### Previous Story Intelligence (6.1 Design tokens and Direction C)

- **Story 6.1** established design tokens in `tailwind.config.js` (colors including focus-ring, primary, text-primary, text-muted, etc.) and Direction C styling. Components use token-based classes (bg-primary, text-muted, ring-focus-ring, etc.). Focus rings are already applied with `focus-visible:ring-2 focus-visible:ring-focus-ring` in AddTaskRow and TaskCard edit label/input; TaskCard delete button still uses `focus:ring-2` — change to focus-visible. Checkbox currently has no focus-visible class — add it. No new tokens required unless contrast audit fails.

### Project Context Reference

- No `project-context.md` in repo. Use this story file and planning artifacts (epics, UX, architecture) as source of truth.

### Story Completion Status

- **Status:** ready-for-dev  
- **Completion note:** Ultimate context engine analysis completed — comprehensive developer guide created. Keyboard order, focus-visible rules, semantic checklist, contrast verification, and test requirements are specified so implementation can proceed without guessing.

---

## Dev Agent Record

### Agent Model Used

Auto (dev-story workflow)

### Debug Log References

( none )

### Completion Notes List

- Task 1: Removed EmptyState section tabIndex and focus styles so no focusable non-interactive element; tab order verified (add input → Add → checkbox → edit → delete). All interactive elements focusable; focus-visible already on AddTaskRow/ErrorState; added to TaskCard checkbox and delete.
- Task 2: TaskCard checkbox given focus-visible:outline-2 outline-offset-2 outline-focus-ring; delete button changed from focus:ring-2 to focus-visible:ring-2 with ring-offset-2.
- Task 3: Verified AddTaskRow form/label/button submit; TaskList ul role="list", TaskCard li; TaskCard checkbox/edit/delete aria-labels and edit input aria-invalid/aria-describedby; completed strikethrough+muted, error role="alert".
- Task 4: Verified keyboard actions (Enter submit, Space checkbox, Enter/Space buttons, Escape cancel edit); no code change.
- Task 5: Contrast verified; comment added in tailwind.config.js; focus-ring token meets 3:1.
- Task 6: Documented in TaskList: focus remains in add input after add; after delete focus not moved for MVP.
- Task 7: E2E tab-order and Retry focusability tests in tasks.spec.ts; unit tests for focusability and semantics in TaskCard, AddTaskRow, TaskList (list/li), ErrorState already had Retry focusable.

### File List

- frontend/src/components/EmptyState.tsx (modified)
- frontend/src/components/TaskCard.tsx (modified)
- frontend/src/components/TaskList.tsx (modified)
- frontend/tailwind.config.js (modified)
- frontend/src/components/TaskCard.test.tsx (modified)
- frontend/src/components/AddTaskRow.test.tsx (modified)
- frontend/src/components/TaskList.test.tsx (modified)
- frontend/e2e/tasks.spec.ts (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)
- _bmad-output/implementation-artifacts/6-2-keyboard-operability-and-wcag-2-1-level-aa.md (modified)

### Change Log

- 2026-03-18: Story 6.2 implemented. Keyboard focus order and focusability (EmptyState no tabIndex), focus-visible on checkbox and delete, semantic markup verified, contrast comment in tailwind.config.js, focus management documented, E2E and unit tests for keyboard/semantics added.
