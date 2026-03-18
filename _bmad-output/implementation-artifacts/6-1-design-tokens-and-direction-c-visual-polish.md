# Story 6.1: Design tokens and Direction C visual polish

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a consistent, minimal visual design with clear hierarchy,
so that the app feels calm and readable and I can focus on my list.

## Acceptance Criteria

1. **Given** the app is implemented  
   **When** I view any screen  
   **Then** colors, typography, and spacing use a defined token set (background, surface, text-primary, text-secondary, text-muted, border, primary, focus-ring, error; font stack, sizes, line heights; base spacing unit and scale)  
   **And** Direction C is applied: add at top, tasks in cards with gap; one primary accent for Add (and Retry); strikethrough and muted for completed  
   **And** Button hierarchy is consistent: primary for Add and Retry; secondary/ghost for delete and edit (UX-DR11)

## Tasks / Subtasks

- [ ] **Task 1: Define design tokens in Tailwind and base styles** (AC: #1)
  - [ ] In `frontend/tailwind.config.js`: extend `theme` with token values. **Colors:** background (page), surface (cards), text-primary, text-secondary, text-muted, border, primary (accent for Add/Retry), focus-ring, error. **Typography:** font stack (system: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif), sizes (body 1rem, metadata 0.875rem), weights, line heights. **Spacing:** base unit (e.g. 4px) and scale (e.g. 2, 3, 4, 5, 6 for 8px, 12px, 16px, 20px, 24px). **Border radius:** card/input/button (e.g. 8px) per Direction C.
  - [ ] In `frontend/src/index.css`: set base font-family and any root-level tokens if using CSS variables; ensure Tailwind base applies token-based defaults where appropriate (e.g. body background). Do not duplicate token values—prefer single source in tailwind.config.js.
- [ ] **Task 2: Apply tokens to AddTaskRow and primary Add button** (AC: #1, #2)
  - [ ] AddTaskRow: input uses border, background (surface or transparent), text-primary, placeholder text-muted, focus-ring; padding and radius from spacing/radius tokens. Add button: bg-primary, text white (or contrasting primary-on), focus-ring; padding per Direction C (e.g. 14px 22px). Add row container: gap from spacing scale (e.g. 8px). Error text uses error token.
  - [ ] Ensure one primary button in list context (Add); no competing primary styling elsewhere in the row.
- [ ] **Task 3: Apply Direction C card styling to TaskCard** (AC: #1, #2)
  - [ ] TaskCard container: background surface (#fafafa equivalent via token), border 1px border token (#eee), border-radius 8px, padding 14px 16px (spacing tokens). List: gap between cards 8px (Direction C). Checkbox: size and border from tokens; completed state uses muted.
  - [ ] Task text: active = text-primary; completed = strikethrough + text-muted (UX-DR8). Metadata (createdAt): text-secondary or text-muted, small size.
  - [ ] Delete control: secondary/ghost—no primary fill; muted text color; visible on focus with focus-ring; min 44×44px touch target preserved (UX-DR10, Story 6.3 may refine). Edit trigger/label: same secondary treatment; focus-ring on focus.
- [ ] **Task 4: Apply tokens to TaskList container and list** (AC: #1, #2)
  - [ ] TaskList wrapper: max-width 560px (or 480px–560px per UX), padding from spacing scale (e.g. 24px), background page background token. Add at top; list below with gap 8px between cards (Direction C). EmptyState/LoadingState/ErrorState sections use same container or token-consistent spacing and text colors.
- [ ] **Task 5: ErrorState and LoadingState token alignment** (AC: #1, #2)
  - [ ] ErrorState: message text uses text-primary or default; Retry button uses **primary** token (same as Add) so only one primary action in view when showing error. Focus-ring on Retry. Spacing and padding from tokens.
  - [ ] LoadingState: spinner uses border and border-t with primary or neutral tokens; text and padding from tokens.
- [ ] **Task 6: EmptyState and App shell** (AC: #1)
  - [ ] EmptyState: message text-secondary or text-primary; "Add your first task" control secondary/ghost (not primary) so hierarchy is clear when list is empty. Focus-ring on focus.
  - [ ] App/main or body: background token (e.g. #f5f5f5 from Direction C mockup) so page has consistent base.
- [ ] **Task 7: Inline edit and validation error styling** (AC: #1)
  - [ ] TaskCard inline edit input: same token set as AddTaskRow input (border, focus-ring, padding, radius). Inline validation error text: error token. No new colors—reuse tokens.
- [ ] **Task 8: Verify token usage and Direction C** (AC: #1, #2, #3)
  - [ ] Remove or replace any remaining hardcoded Tailwind color classes (e.g. gray-300, blue-600, red-600) with token-based classes across TaskCard, AddTaskRow, TaskList, ErrorState, LoadingState, EmptyState, App.
  - [ ] Confirm Direction C: add at top, cards with gap, one primary accent (Add + Retry), strikethrough + muted for completed, secondary delete/edit.
  - [ ] Confirm button hierarchy: primary = Add, Retry only; secondary/ghost = delete, edit (UX-DR11).

## Dev Notes

- **Epic 6 goal:** Accessibility, responsiveness, and quality—keyboard, WCAG 2.1 AA, responsive layout, touch targets (FR24–FR28). This story establishes design tokens and Direction C visual polish so later stories (6.2 keyboard/WCAG, 6.3 responsive) can rely on consistent tokens and focus/contrast.
- **Current state:** Tailwind is in use with empty `theme.extend`. Components use hardcoded classes (gray-*, blue-600, red-600, #fafafa, #eee). Direction C is partially applied (cards with bg and border, add at top, gap) but not via a single token set; primary button styling is repeated (Add, Retry) but not from a named token.
- **Reference:** `_bmad-output/planning-artifacts/ux-design-directions.html` — Direction C block (`.dir-c`) defines exact values: body #f5f5f5; add-row gap 8px, margin-bottom 20px; input padding 14px 18px, border #e0e0e0, radius 8px; button #1e40af, padding 14px 22px, radius 8px; list gap 8px; card padding 14px 16px, background #fafafa, border #eee, radius 8px; completed text #888 strikethrough; delete ghost #999. Map these to semantic tokens (background, surface, border, primary, text-muted, etc.) in Tailwind.
- **UX-DR1:** Design tokens for color, typography, spacing; use in utility classes and components. **UX-DR8:** Direction C—add at top, cards (background, border, radius, padding), gap, one primary accent, strikethrough and muted for completed. **UX-DR11:** Primary for Add and Retry; secondary/ghost for delete and edit; one primary button visible at a time in list view.

### Project Structure Notes

- **Config:** `frontend/tailwind.config.js` — extend theme with tokens; `frontend/src/index.css` — base layer if needed.
- **Components to update:** `TaskList.tsx`, `TaskCard.tsx`, `AddTaskRow.tsx`, `ErrorState.tsx`, `LoadingState.tsx`, `EmptyState.tsx`, `App.tsx`. No backend changes.
- **Do not add** new components or change behavior (keyboard, ARIA) in this story; that is 6.2. This story is visual tokens and Direction C only.

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Visual Design Foundation (color system, typography, spacing); Design Direction Decision (Direction C); UX-DR1, UX-DR8, UX-DR11.
- [Source: _bmad-output/planning-artifacts/ux-design-directions.html] — Direction C CSS values for add-row, input, button, list, card, completed, delete.
- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 6, Story 6.1; AC: token set, Direction C, button hierarchy.
- [Source: _bmad-output/planning-artifacts/architecture.md] — Styling: Tailwind CSS + design tokens (UX Direction C); component names TaskList, TaskCard, AddTaskRow, etc.

---

## Developer Context

### Technical Requirements

- **Token set (semantic names in Tailwind):**
  - **Colors:** `background` (page, e.g. #f5f5f5), `surface` (cards, e.g. #fafafa), `text-primary`, `text-secondary`, `text-muted` (e.g. #888 for completed), `border` (e.g. #e0e0e0 / #eee), `primary` (accent, e.g. #1e40af for Add/Retry), `focus-ring` (visible focus, e.g. primary or neutral 2px), `error` (e.g. red-600 equivalent). Use `theme.extend.colors` so utilities are `bg-surface`, `text-primary`, `border-border`, `ring-focus-ring`, etc.
  - **Typography:** `fontFamily` (system stack), `fontSize` (body 1rem, metadata 0.875rem), `fontWeight`, `lineHeight` in theme.extend.
  - **Spacing:** Base unit 4px; scale in theme.extend.spacing if needed (e.g. 2→8px, 3→12px, 4→16px, 5→20px, 6→24px). Direction C uses 8px gap, 14–16px padding, 20–24px section padding.
  - **Border radius:** e.g. `rounded-lg` or custom `radius-card` 8px for cards, inputs, buttons.
- **Direction C application:**
  - Add row at top; margin/gap below add row (e.g. 20px) then list.
  - List: `flex flex-col gap-2` (8px) between cards.
  - Each card: `bg-surface border border-border rounded-lg` (8px) with padding 14px 16px; checkbox, content, delete aligned.
  - Primary button: `bg-primary` (Add, Retry) with contrasting text and focus ring.
  - Completed: `line-through text-muted`. Delete/edit: no `bg-primary`; use muted/ghost style and focus-ring.
- **Button hierarchy:** Add and Retry are the only elements using `bg-primary` (or equivalent primary token). Delete and edit triggers use transparent/muted background and focus-ring; do not use primary color for them.

### Architecture Compliance

- **Naming:** Use Tailwind theme keys (e.g. `primary`, `surface`) not ad-hoc hex in class names. Components stay PascalCase; no file renames required.
- **Structure:** All styling changes in `frontend/`; `tailwind.config.js` and components only. No API or backend changes.
- **Patterns:** Utility-first CSS per architecture; design tokens in theme.extend; components consume tokens via Tailwind classes (e.g. `bg-primary`, `text-muted`). No inline hex in JSX; use token class names.
- **UX alignment:** Follow UX-DR1 (tokens), UX-DR8 (Direction C), UX-DR11 (button hierarchy). Reference ux-design-directions.html Direction C for exact values to map into tokens.

### Library / Framework Requirements

- **Tailwind CSS:** Already in use. Extend `theme` in `tailwind.config.js`; do not introduce a second design-token system (e.g. no separate CSS-in-JS theme object). Use Tailwind’s theme extension for colors, fontFamily, fontSize, spacing, borderRadius.
- **No new dependencies** for this story.

### File Structure Requirements

- **Modify:** `frontend/tailwind.config.js`, `frontend/src/index.css` (if base styles needed), `frontend/src/App.tsx`, `frontend/src/components/TaskList.tsx`, `frontend/src/components/TaskCard.tsx`, `frontend/src/components/AddTaskRow.tsx`, `frontend/src/components/ErrorState.tsx`, `frontend/src/components/LoadingState.tsx`, `frontend/src/components/EmptyState.tsx`.
- **Do not create** new component files or new CSS modules; keep a single Tailwind-driven approach.

### Testing Requirements

- **Visual/regression:** After implementation, run the app and confirm: (1) all screens use token-based colors (no raw gray/blue in DOM for main UI); (2) Direction C: add at top, cards with gap, primary Add and Retry only, completed strikethrough+muted, delete/edit ghost; (3) focus states visible on interactive elements.
- **Existing tests:** No behavior change; existing E2E (e2e/tasks.spec.ts, smoke.spec.ts) and unit tests should still pass. If tests assert on specific class names (e.g. `bg-blue-600`), update those assertions to token-based class names (e.g. `bg-primary` or whatever class name is used).
- **Optional:** Add a minimal smoke test that the root or TaskList renders with expected token-derived classes if the team wants to lock token usage.

### Previous Story Intelligence (cross-epic)

- **Story 5.1 (Edit task / TaskCard):** TaskCard already has inline edit, checkbox, delete, createdAt; uses hardcoded `border-[#eee]`, `bg-[#fafafa]`, `gray-*`, `blue-600`, `red-600`. Replace those with token classes in this story; do not change edit/complete/delete behavior or ARIA. Same file locations: `frontend/src/components/TaskCard.tsx`, `AddTaskRow.tsx`, `ErrorState.tsx`, etc. Testing: Playwright E2E in `frontend/e2e/`; ensure no regression in add/complete/edit/delete flows while only swapping styling to tokens.

### Project Context Reference

- No `project-context.md` found. Follow this story file and planning artifacts (epics, UX, architecture) as the source of truth.

### Story Completion Status

- **Status:** ready-for-dev  
- **Completion note:** Ultimate context engine analysis completed — comprehensive developer guide created. All token names, Direction C values, file list, and button hierarchy are specified so implementation can proceed without guessing.
