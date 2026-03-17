# Code Review Report: Story 1-2 (Backend todo API and SQLite persistence)

**Review mode:** Full (spec + diff)  
**Diff source:** Uncommitted changes (staged + unstaged, incl. untracked)  
**Spec:** `_bmad-output/implementation-artifacts/1-2-backend-todo-api-and-sqlite-persistence.md`  
**Layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor

---

## Intent Gaps

*None.*

---

## Bad Spec

*None.*

---

## Patch (fixable code issues)

1. **Tests and config don’t support in-memory DB**  
   **Location:** `backend/src/db/index.ts` (getDbPath), `backend/drizzle.config.ts` (getDbUrl)  
   **Detail:** `getDbPath()` only uses `DATABASE_URL` when it starts with `file:`; `:memory:` falls through to the default file path. Tests set `process.env.DATABASE_URL = ':memory:'` but still hit the file DB. `drizzle.config.ts` has the same gap. The DB is also a singleton created at module load, so test isolation is weak.  
   **Fix:** In `getDbPath()` / `getDbUrl()`, treat `DATABASE_URL === ':memory:'` (or `url === ':memory:'`) explicitly and return it so SQLite uses an in-memory DB. Optionally ensure tests don’t share a single module-loaded DB (e.g. create app/db per test or reset between tests).

2. **README run order**  
   **Location:** `README.md`  
   **Detail:** README lists `npm run db:migrate` before `npm install`. Migrations require installed deps (e.g. drizzle-kit).  
   **Fix:** Order: `npm install`, then `cp .env.example .env`, then `npm run db:migrate`.

3. **DB path/URL logic duplicated and incomplete**  
   **Location:** `backend/src/db/index.ts`, `backend/drizzle.config.ts`  
   **Detail:** Same rules (DB_PATH, then DATABASE_URL with `file:`, then default) exist in both places. Also, `DATABASE_URL` values that don’t start with `file:` (e.g. `sqlite:...`) fall through to the default path.  
   **Fix:** Extract a shared helper (e.g. `getDbPath()` in one module and import it in the other), or document the contract. Explicitly handle or reject non-`file:` URLs if they’re in scope.

4. **Internal server errors not logged**  
   **Location:** `backend/src/app.ts` (error handler)  
   **Detail:** The error handler returns a generic body for non-validation errors but does not log the error, making production debugging harder.  
   **Fix:** Log the error (e.g. `request.log.error(err)` or `app.log.error(err)`) before sending the response.

5. **Sprint status comment mismatch**  
   **Location:** `_bmad-output/implementation-artifacts/sprint-status.yaml`  
   **Detail:** Comment says `(story 1-2 created)` while `last_updated` says `(story 1-2 review)`.  
   **Fix:** Align both to the same status (e.g. “story 1-2 review”).

6. **Error handler brittle**  
   **Location:** `backend/src/app.ts`  
   **Detail:** Only `FST_ERR_VALIDATION` is mapped to `VALIDATION_ERROR`; everything else becomes `INTERNAL_ERROR`. Loose cast to `{ code?, message?, statusCode? }`.  
   **Fix:** Consider a small type guard or explicit code whitelist; optionally log unknown codes.

7. **fastify.d.ts imports a value**  
   **Location:** `backend/src/types/fastify.d.ts`  
   **Detail:** `import type { db }` — `db` is a value. Declaration files should depend only on types to avoid pulling in runtime code.  
   **Fix:** Use `import type { db }` only if it’s a type-only export, or use `typeof db` from a type-only import path; ensure no runtime dependency from `.d.ts`.

8. **Missing tests for 5xx and validation error shape**  
   **Location:** `backend/tests/todos.test.ts`  
   **Detail:** AC/Task 4 requires tests for error responses (e.g. 404 or 5xx) returning `{ code, message }`. Only 404 is tested; INTERNAL_ERROR (5xx) and VALIDATION_ERROR (4xx) response shapes are not.  
   **Fix:** Add tests that trigger the error handler (e.g. invalid response shape or a route that throws) and assert status and `{ code, message }`.

9. **DATABASE_URL=file: with no path**  
   **Location:** `backend/src/db/index.ts` (getDbPath)  
   **Detail:** `url.slice(5).trim()` can be empty, passing an empty path to SQLite.  
   **Fix:** After `slice(5).trim()`, if the result is empty, use the default path or reject invalid config.

10. **Parent dir ./data may not exist**  
    **Location:** `backend/src/db/index.ts`  
    **Detail:** Default path `./data/todos.db` can be used when `./data` doesn’t exist, causing DB open to throw.  
    **Fix:** Ensure directory exists (e.g. `mkdirSync(dirname(path), { recursive: true })`) or catch and handle the error with a clear message.

11. **Unhandled promise rejection in start()**  
    **Location:** `backend/src/app.ts` (start)  
    **Detail:** If `app.listen()` or prior async work rejects, the rejection is unhandled.  
    **Fix:** `start().catch(err => { app?.log?.error(err); process.exit(1) })` or equivalent.

12. **Possible null/undefined created_at in toApiTask**  
    **Location:** `backend/src/routes/todos.ts` (toApiTask)  
    **Detail:** If `row.created_at` is null/undefined, `.toISOString()` throws.  
    **Fix:** Guard: e.g. `createdAt: row.created_at != null ? row.created_at.toISOString() : ''` or enforce at schema/DB level so it’s never null.

13. **drizzle.config driver vs dialect**  
    **Location:** `backend/drizzle.config.ts`  
    **Detail:** Spec says “use `driver: 'better-sqlite'`”; diff uses `dialect: 'sqlite'`. Drizzle Kit may have moved to `dialect`; if so, spec is outdated; if not, config should use the correct key.  
    **Fix:** Confirm current Drizzle Kit API and use the correct option; if `dialect` is correct, consider updating the spec.

14. **Zod createdAt does not enforce ISO 8601**  
    **Location:** `backend/src/schemas/todos.schema.ts`  
    **Detail:** AC and dev notes require ISO 8601 for dates; schema has `createdAt: z.string()` with only a comment.  
    **Fix:** Use e.g. `z.string().datetime()` or a regex to enforce ISO 8601 format.

15. **PORT=0 (ephemeral) clamped to 1**  
    **Location:** `backend/src/app.ts`  
    **Detail:** Code clamps port to 1–65535, so `PORT=0` (common for “pick a port”) becomes 1.  
    **Fix:** If ephemeral port is desired: treat `rawPort === 0` specially (e.g. pass 0 to `listen` or skip clamping when 0).

16. **Test run guard: isRunDirectly vs process.env.TEST**  
    **Location:** `backend/src/app.ts`  
    **Detail:** Completion notes say “only start() when not process.env.TEST”; implementation uses `isRunDirectly` (argv vs import.meta.url). Both achieve “don’t listen in tests” but differ from the documented intent.  
    **Fix:** Use `process.env.TEST` for consistency with the completion notes, or update the notes to describe `isRunDirectly`.

17. **Explicit reply.status(200) on GET /api/todos**  
    **Location:** `backend/src/routes/todos.ts`  
    **Detail:** Handler uses `return reply.status(200).send(body)`; 200 is default for GET.  
    **Fix:** Optional: use `return reply.send(body)` for consistency with the health route.

---

## Defer (pre-existing or out of scope)

*None.*

---

## Summary

- **0** intent_gap  
- **0** bad_spec  
- **17** patch  
- **0** defer  
- **2** findings rejected as noise (`.env.example` unchanged in diff; tasks vs todos naming is intentional per spec)

---

## Next steps

- **Patch:** Address in a follow-up implementation pass or manually. Prioritize in-memory test DB (#1), README order (#2), error logging (#4), and missing error tests (#8); then path/URL and edge cases (#3, #9–12, #15) and schema/config (#13, #14, #16).
- No intent or spec changes required for this review.
