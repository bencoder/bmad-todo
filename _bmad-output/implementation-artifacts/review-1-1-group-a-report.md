# Code Review Report — Story 1.1 (Group A: root + Docker + backend)

**Scope:** Chunk 1 of 2. Group B (frontend) to be reviewed in a separate run.

**Diff source:** Uncommitted changes, story 1-1-project-scaffold-and-runnable-full-stack-app.  
**Spec:** `_bmad-output/implementation-artifacts/1-1-project-scaffold-and-runnable-full-stack-app.md`  
**Layers run:** Blind Hunter, Edge Case Hunter, Acceptance Auditor.

---

## Triage note

- **Blind Hunter** was given an abbreviated diff (docker-compose and some files summarized). Findings that referred to “invalid YAML” or “invalid .prettierrc” or missing `"type": "module"` were checked against the real repo: the actual `docker-compose.yml` and `.prettierrc` are valid, and `backend/package.json` includes `"type": "module"`. Those were **rejected** as artifacts of the summary.
- **Edge Case Hunter** and **Acceptance Auditor** had correct context; their findings were normalized and merged where overlapping.

---

## Patch (fixable code issues)

1. **Add backend `.dockerignore`**  
   **Location:** `backend/`  
   **Detail:** `COPY . .` in the backend Dockerfile can pull in `node_modules` and `.env` from the host if present, which can override container deps or leak secrets. Add `backend/.dockerignore` excluding at least `node_modules`, `.env`, and common build/cache paths (e.g. `dist`, `.git`).

2. **Validate or clamp PORT in backend**  
   **Location:** `backend/src/app.ts` (port derivation)  
   **Detail:** `Number(process.env.PORT) || 3000` does not guard against negative, zero, or out-of-range values (e.g. > 65535 or NaN). Clamp to a valid range (e.g. 1–65535) or validate and exit with a clear error so the server does not fail in an obscure way.

3. **README: state that E2E requires backend (or stack) running**  
   **Location:** `README.md` (E2E / smoke section)  
   **Detail:** The E2E step says to run `npm run test:e2e` from `frontend/` but does not explicitly say the backend (or full stack via docker-compose) must be running first. Add a short note so failures are easier to interpret.

---

## Defer (not caused by this change; note for later)

1. **Graceful shutdown (SIGTERM/SIGINT)**  
   **Detail:** No handler for SIGTERM/SIGINT to call `app.close()` before exit. In Docker this can lead to abrupt process kill. Story 1.1 only requires a runnable shell and smoke verification; graceful shutdown can be added in a later story.

2. **CORS `origin: true` in production**  
   **Detail:** `origin: true` allows any origin. For production, origin should be restricted. Spec allows “optional minimal CORS” for this story; tightening can be deferred to a later story.

3. **BACKEND_PORT / compose env validation**  
   **Detail:** If `BACKEND_PORT` is set to a non-numeric value, Compose may fail or bind incorrectly. Consider validating in a follow-up (or document expected format in README).

---

## Intent Gaps

None.

---

## Bad Spec

None.

---

## Summary

- **0** intent_gap  
- **0** bad_spec  
- **3** patch  
- **3** defer  
- **6** findings rejected as noise (invalid YAML/.prettierrc/type:module and README “run separately” underspecified, based on summarized diff or already satisfied by README).

**Acceptance Auditor:** No violations found for Group A (root, Docker, backend). Frontend (Group B) is out of scope for this chunk.

---

## Next steps

- **Patch:** Address the three patch items in a follow-up implementation pass or manually (`.dockerignore`, PORT validation, README E2E note).
- **Defer:** No action required for this change; deferred items are noted for future attention.
- **Group B:** Run code review again for **frontend/** (and any remaining files) when ready; say you’re reviewing “Group B” or “frontend” so the diff is limited to that chunk.
