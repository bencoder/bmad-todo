# Code Review: Story 3.1 — Create task API (POST)

**Review date:** 2026-03-17  
**Diff source:** Staged changes (backend app, routes, schemas, tests)  
**Spec:** 3-1-create-task-api-post.md  
**Layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor

---

## Intent Gaps

*None.*

---

## Bad Spec

*None.*

---

## Patch (fixable code issues)

1. **Validation response body wrong for formatter-produced errors**  
   **Source:** edge + auditor  
   **Location:** `backend/src/app.ts` (setErrorHandler)  
   The schema error formatter returns an `Error` with `code: 'VALIDATION_ERROR'` and `statusCode: 400`, but the error handler only treats `e.code === 'FST_ERR_VALIDATION'` as validation. So formatter-produced errors get `code: 'INTERNAL_ERROR'` and `message: 'Internal Server Error'` in the response body while status is still 400. AC requires 400 with `{ code, message }` where code is `VALIDATION_ERROR`. Fix: in setErrorHandler, treat `e.code === 'VALIDATION_ERROR'` (or `e.statusCode === 400`) as validation so the response body matches the spec.

2. **No guard for empty `errors` in schema error formatter**  
   **Source:** blind + edge  
   **Location:** `backend/src/app.ts` (setSchemaErrorFormatter)  
   If `errors` is empty, the message becomes `""` and the client gets an unhelpful error. Add a guard (e.g. use a fallback message when `errors.length === 0`).

3. **Schema error formatter assumes narrow error shape**  
   **Source:** blind  
   **Location:** `backend/src/app.ts` (setSchemaErrorFormatter)  
   Each error is typed as `{ instancePath?: string; message?: string }`. Validators can include `keyword`, `params`, etc. The type is incomplete and the formatted message may omit useful validation details. Widen the type or use a more defensive access pattern.

4. **Validation message formatting can be brittle**  
   **Source:** blind  
   **Location:** `backend/src/app.ts` (setSchemaErrorFormatter)  
   Building the message as `${dataVar}${e.instancePath ?? ''} ${e.message ?? ''}` can produce redundant paths (e.g. `body` + `/body/description`) and awkward spacing when `instancePath` is empty. Consider normalizing or trimming.

5. **POST handler throws generic Error on missing row**  
   **Source:** blind  
   **Location:** `backend/src/routes/todos.ts` (POST handler)  
   Throwing `new Error('Insert did not return row')` yields a 500 with a generic message. For consistency with the API’s structured errors, use a known code (e.g. attach `code` and `statusCode`) or document this as an internal failure path.

6. **Body type asserted instead of inferred**  
   **Source:** blind  
   **Location:** `backend/src/routes/todos.ts`  
   Using `request.body as CreateTaskBody` bypasses type safety if the route schema and type drift. Prefer a type derived from the route schema or a single shared schema type.

7. **DB errors from insert/returning() unhandled**  
   **Source:** edge  
   **Location:** `backend/src/routes/todos.ts` (POST handler)  
   If `app.db.insert(tasks).values({ description }).returning()` throws (e.g. constraint, connection), the rejection is unhandled and the global error handler returns 500. Consider catching and mapping to an appropriate status (e.g. 409 for conflict) or a consistent error shape.

8. **Tests don’t clean up after creating a task**  
   **Source:** blind  
   **Location:** `backend/tests/todos.test.ts`  
   The successful POST test deletes all tasks at the start but does not remove the task it creates. With shared or ordered runs, later tests can see leftover data. Isolate tests (e.g. delete after assert or use a dedicated table/DB per test).

9. **Validation tests don’t assert message content**  
   **Source:** blind  
   **Location:** `backend/tests/todos.test.ts`  
   For 400 validation cases, tests check `body.code` and sometimes that `body.message` is a string. They don’t assert that the message refers to the field or reason (e.g. description required), so wrong or empty messages could slip through.

10. **Limited invalid-body test coverage**  
    **Source:** blind  
    **Location:** `backend/tests/todos.test.ts`  
    Only `payload: {}` (missing description) and `payload: { description: '' }` are tested. Consider adding cases for invalid types (e.g. `description: 123`, `description: null`) or whitespace-only strings if the product rule treats them as invalid.

---

## Defer (pre-existing or out of scope)

1. **Mutating a plain Error with custom properties**  
   **Source:** blind  
   Adding `code` and `statusCode` on a generic `Error` works at runtime but is not in the type. Acceptable for this codebase unless strict typing or custom serialization is required.

2. **Insert omits `user_id`**  
   **Source:** blind  
   Only `{ description }` is passed. If the table has a required or meaningful `user_id` for multi-tenancy, this would need product/spec clarification. Story 3.1 and schema do not require it; defer unless product specifies otherwise.

3. **Reliance on global error serialization**  
   **Source:** blind  
   Tests expect `body.code` and `body.message` from the global error handler. If the handler is missing or changed, tests would fail without a route change. Architecture choice; no change in this story.

4. **app.db undefined**  
   **Source:** edge  
   If `app.db` were undefined, the handler would throw before responding. App build guarantees decorate('db'); no change needed in this diff.

5. **returning() row with undefined created_at**  
   **Source:** edge  
   If the returned row had undefined `created_at`, `toApiTask(row)` could throw. Schema and DB defaults make this unlikely; defer unless schema is relaxed.

---

## Summary

**0** intent_gap, **0** bad_spec, **10** patch, **5** defer findings. **0** findings rejected as noise.

---

## Next steps

- **Patch:** Address items 1–10 in a follow-up implementation pass or manually. Highest impact: (1) error handler recognizing `VALIDATION_ERROR` so validation responses match the spec and tests.
- **Defer:** No action required for this change; deferred items are noted for future attention.
