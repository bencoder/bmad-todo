# Code Review Report — Story 1.1 (Group B: frontend)

**Scope:** Chunk 2 of 2. Group A (root, Docker root, backend) was reviewed separately.

**Diff source:** Uncommitted changes (frontend/ only — all new files).  
**Spec:** `_bmad-output/implementation-artifacts/1-1-project-scaffold-and-runnable-full-stack-app.md`  
**Layers run:** Blind Hunter, Edge Case Hunter, Acceptance Auditor.

---

## Triage note

- **Blind Hunter** and **Edge Case Hunter** findings were normalized and merged where overlapping (e.g. `#root` non-null assertion, `VITE_API_URL` normalization).
- **Acceptance Auditor** findings were compared to spec; one classified as bad_spec (spec vs. implementation intent), one as patch (E2E assertion).
- **Rejects:** 0. No findings were dropped as noise.

---

## Bad Spec

These findings suggest the spec should be amended. Consider regenerating or amending the spec with this context:

1. **Frontend Dockerfile omits prod multi-stage build**  
   **Detail:** Library / Framework Requirements (Docker) say “Use multi-stage build for frontend (build with Node, serve with nginx for prod).” The diff adds a single-stage Dockerfile that runs the Vite dev server and a comment that prod multi-stage is deferred to a later story. So either this story should implement the multi-stage build, or the spec should explicitly allow “this story: dev server only; multi-stage build in a later story.”  
   **Suggested spec amendment:** In the Docker / Frontend section, state that for Story 1.1 the frontend container may run the Vite dev server only; multi-stage build (build + nginx serve) is required in a later story (e.g. production deploy).

---

## Patch (fixable code issues)

These are fixable code issues:

1. **Smoke E2E does not verify frontend-to-backend connectivity**  
   **Location:** `frontend/e2e/smoke.spec.ts`  
   **Detail:** AC #1 requires “A smoke test or manual verification confirms both services run and the frontend can reach the backend.” The current E2E only checks that the app loads and shows the app title; it does not assert that the backend is reachable (e.g. “Reachable” text or a successful `/api/health` call). Add an assertion so the smoke test fails when the backend is down.

2. **`.env.example` omits `PROXY_TARGET`**  
   **Location:** `frontend/.env.example`  
   **Detail:** `vite.config.ts` uses `process.env.PROXY_TARGET` for the dev proxy target; the example only documents `VITE_API_URL`. Add a line (e.g. `# PROXY_TARGET=http://backend:3000`) so proxy configuration is documented.

3. **No runtime normalization or validation of `VITE_API_URL`**  
   **Location:** `frontend/src/App.tsx` (URL construction)  
   **Detail:** `App.tsx` builds URLs as `${API_BASE}/api/health`. If `VITE_API_URL` has a trailing slash or a path-like value (e.g. `'/api'`), this can produce double slashes or wrong paths (e.g. `/api/api/health`). The comment says “no trailing slash” but the code does not normalize or validate. Normalize (e.g. trim trailing slash) or validate and document expected format.

4. **`main.tsx` uses non-null assertion on `getElementById('root')`**  
   **Location:** `frontend/src/main.tsx:6`  
   **Detail:** If `index.html` is changed and `#root` is missing, `createRoot(null)` throws at runtime instead of failing with a clear message. Add a null check and throw a clear error or log and exit.

5. **ESLint flat config: `extends` inside config object**  
   **Location:** `frontend/eslint.config.js`  
   **Detail:** The config uses `extends: [js.configs.recommended, ...tseslint.configs.recommended]` inside a config object passed to `tseslint.config()`. In ESLint 9 flat config, `extends` may not be supported that way; configs are typically spread at the top level of the array. Verify and fix so ESLint runs with the intended rules.

6. **Add frontend `.dockerignore`**  
   **Location:** `frontend/`  
   **Detail:** The Dockerfile uses `COPY . .`, which can pull in host `node_modules`, `.env`, `dist`, or other artifacts, causing bloat, cache issues, or secret leakage. Add `frontend/.dockerignore` excluding at least `node_modules`, `.env`, `dist`, and common build/cache paths.

7. **Dockerfile: `package-lock.json*` optional but `npm ci` requires it**  
   **Location:** `frontend/Dockerfile`  
   **Detail:** `COPY package-lock.json*` allows a missing lockfile, but `npm ci` requires it; the build will fail if the lockfile is absent. Either require the lockfile (remove the `*`) or use a conditional (e.g. `npm ci` when present, `npm install` when not) and document the intent.

8. **Unit test does not mock `fetch`**  
   **Location:** `frontend/src/App.test.tsx`  
   **Detail:** The test renders `App`, which triggers a real `/api/health` request. The test can be flaky or fail in CI when the backend is unavailable. Mock `fetch` (or the health endpoint) so health-check behavior is isolated.

9. **No TypeScript typing for `VITE_API_URL`**  
   **Location:** `frontend/src/vite-env.d.ts`  
   **Detail:** There is no `ImportMetaEnv` augmentation for `VITE_API_URL`, so type safety and editor support for env usage are missing. Add an interface extending `ImportMetaEnv` with `VITE_API_URL: string` (or similar).

10. **Favicon 404**  
    **Location:** `frontend/index.html`  
    **Detail:** `index.html` references `/vite.svg` but the diff does not add `vite.svg`. Add the asset or replace the link so the favicon does not 404.

11. **useEffect health fetch has no cleanup**  
    **Location:** `frontend/src/App.tsx:8-14`  
    **Detail:** If the component unmounts before the `/api/health` fetch completes, `setBackendStatus` can run on an unmounted component, causing a React warning and possible memory leak. Use an `AbortController` in the effect and pass its signal to `fetch`, and abort on cleanup.

---

## Defer (not caused by this change; note for later)

1. **Dockerfile runs as root**  
   **Detail:** No `USER` directive; the process runs as root. For production or shared images, consider adding a non-root user. Story 1.1 only requires a runnable shell; hardening can be deferred.

2. **No fetch timeout in `App.tsx`**  
   **Detail:** The health `fetch()` has no timeout, so a stuck backend can leave the UI in “Checking…” indefinitely. Optional improvement for a later story.

3. **E2E baseURL and port hardcoded**  
   **Detail:** `playwright.config.ts` uses a fixed `baseURL` and dev server URL; changing the Vite port requires changing the config in multiple places. Consider a shared constant or env for port/baseURL in a later refactor.

4. **`tsconfig.node.json` only includes `vite.config.ts`**  
   **Detail:** Other Node config files (`playwright.config.ts`, `vitest.config.ts`) are not included; they may not be type-checked under the same Node config. Config scope can be revisited later.

5. **No accessibility for dynamic backend status**  
   **Detail:** The “Backend: …” status is plain text with no `aria-live` or `role`; status changes may not be announced to screen readers. A11y improvement for a later story.

6. **Prettier format script skips config files**  
   **Detail:** The `format` script only covers `src/**/*.{ts,tsx,css,json}`, so root config files are not formatted by the script. Consistency improvement for later.

---

## Intent Gaps

None.

---

## Summary

- **0** intent_gap  
- **1** bad_spec  
- **11** patch  
- **6** defer  
- **0** findings rejected as noise  

**Acceptance Auditor:** Two findings: (1) Docker multi-stage build missing vs. spec → bad_spec; (2) Smoke E2E does not verify backend reachability → patch.

---

## Next steps

- **Bad spec:** Amend the story/spec to state that frontend Docker multi-stage build is deferred to a later story (or implement it in this story).
- **Patch:** Address the 11 patch items in a follow-up implementation pass or manually (E2E assertion, .env.example, VITE_API_URL normalization, main.tsx null check, ESLint config, .dockerignore, Dockerfile lockfile, fetch mock, vite-env.d.ts, favicon, useEffect cleanup).
- **Defer:** No action required for this change; deferred items are noted for future attention.
