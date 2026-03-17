# Code Review 3-2: Triage

**Story:** 3-2 AddTaskRow and add task in UI  
**Diff:** uncommitted changes (code-review-3-2-diff.txt)  
**Review mode:** full  
**Layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor (all completed)

## Normalized and deduplicated findings

| ID | Source | Title | Detail | Location | Category |
|----|--------|-------|--------|----------|----------|
| 1 | blind | No guard that `description` is a string | Passing a number or object to `createTodo` will throw when calling `.trim()`. Callers (AddTaskRow/TaskList) pass strings; defensive check would harden API. | frontend/src/api/todos.ts | patch |
| 2 | blind+edge | Empty or whitespace-only description can reach API | TaskList guards with `trimmedDescription === ''`; createTodo and useCreateTodo do not validate. AddTaskRow trims before onSubmit so empty can be passed. Edge: unnecessary POST that fails with 4xx; mutateAsync('') possible. | frontend/src/api/todos.ts, useCreateTodo.ts, AddTaskRow.tsx | patch |
| 3 | blind+edge | Response validation and id coercion | Validation only requires `id` and `description`; `completed`/`createdAt` coerced. Server returning non-numeric `id` (e.g. string, null) yields NaN or 0 — broken list keys or display. | frontend/src/api/todos.ts:58-59 | patch |
| 4 | blind | useEffect dependency in AddTaskRow | Effect depends on `[clearInputRef]` but uses `clearInput`; `clearInput` not in deps — stale closure risk if clearInput changes. | frontend/src/components/AddTaskRow.tsx | patch |
| 5 | blind | TaskList create error handler swallows rejection | `.catch(() => {})` ignores rejection with no logging. TanStack Query still sets isError/error so UX shows message; catch is redundant and hides debugging. | frontend/src/components/TaskList.tsx | patch |
| 6 | auditor | Error-path test does not assert input retained | Test "shows inline error when create mutation fails" sets isError/error and asserts alert + input in document; does not simulate type → submit → fail and assert that input value is retained. | frontend/src/components/TaskList.test.tsx | patch |
| 7 | auditor | No test that list shows new task after add | Success test asserts mutateAsync called with trimmed value and input cleared; does not mock refetch or assert that the new task appears in the list. | frontend/src/components/TaskList.test.tsx | patch |
| 8 | blind | Single-line fetch/parse/validate in createTodo | Dense logic is hard to read and maintain; splitting into steps would improve clarity. | frontend/src/api/todos.ts | defer |
| 9 | blind | clearInputRef ref-stability | If parent passes a ref that changes identity, effect may run every render or hold stale callback. | frontend/src/components/AddTaskRow.tsx | defer |
| 10 | blind | No timeout or abort for createTodo fetch | Long-running or hanging requests cannot be cancelled; pre-existing fetch pattern. | frontend/src/api/todos.ts | defer |

## Rejected (noise / false positive)

- **createTodo uses `url` but not defined** — In full code, `url` comes from `getTodosUrl()` in same file.
- **queryClient origin in useCreateTodo** — Code uses `useQueryClient()` inside the hook.
- **getErrorMessage(createError) not defined** — Defined in TaskList.tsx in same file.
- **Tests only described with `...`** — Full test bodies are present in the diff; summary in Blind Hunter prompt was truncated.
- **fetch throws (network error)** — Rejection propagates to mutation; TanStack Query sets error and UI shows it. Handled.

**Reject count:** 5

## Summary

**0** intent_gap, **0** bad_spec, **7** patch, **3** defer. **5** findings rejected as noise.
