# aine-training

Full-stack todo app: Vite + React + TypeScript frontend, Fastify + TypeScript backend, Docker Compose for local runs.

## Prerequisites

- Node.js 20+
- Docker and Docker Compose (optional; for `docker-compose up`)

## Run with Docker Compose

From the repo root:

```bash
docker-compose up
```

- **Frontend:** http://localhost:5173 (Vite dev server)
- **Backend API:** http://localhost:3000 (e.g. `GET /api/health`)

The frontend is configured to call the backend via `VITE_API_URL` (defaults to proxy to `http://localhost:3000` when running in Docker Compose). Open http://localhost:5173 in a browser; the app shows "Backend: Reachable" when the API is available.

## Run frontend and backend separately

**Backend:**

```bash
cd backend
cp .env.example .env   # optional: set PORT, DB_PATH or DATABASE_URL
npm install
npm run db:migrate     # create DB and run migrations (uses ./data/todos.db by default)
npm run dev
```

Backend listens on http://localhost:3000 (or `PORT` from `.env`).

**Frontend:**

```bash
cd frontend
cp .env.example .env   # optional: set VITE_API_URL if backend is not on localhost:3000
npm install
npm run dev
```

Frontend runs at http://localhost:5173. If `VITE_API_URL` is not set, Vite proxies `/api` to `http://localhost:3000`.

## Smoke verification

1. **Manual:** Run `docker-compose up`, open http://localhost:5173, confirm the page loads and shows "Backend: Reachable". Call `curl http://localhost:3000/api/health` and expect `{"ok":true}`.

2. **E2E (Playwright):** From `frontend/`, run `npm run test:e2e`. **The backend (or full stack via `docker-compose up`) must be running first**, or tests that call the API will fail. You can rely on `playwright.config.ts` to start the frontend dev server; ensure the backend is reachable at the URL the frontend uses (e.g. proxy or `VITE_API_URL`).

## Project structure

- `frontend/` — Vite + React + TypeScript, Tailwind, Vitest, Playwright, Prettier, ESLint
- `backend/` — Fastify + TypeScript, Prettier, Drizzle ORM + SQLite (see `backend/.env.example` for `DB_PATH` / `DATABASE_URL`)
- `docker-compose.yml` — services `frontend` and `backend`

## Scripts

| Location   | Command        | Description                |
|-----------|----------------|----------------------------|
| frontend/ | `npm run dev`  | Vite dev server            |
| frontend/ | `npm run build`| Production build           |
| frontend/ | `npm run test:run` | Unit tests (Vitest)    |
| frontend/ | `npm run test:e2e`  | E2E tests (Playwright) |
| backend/  | `npm run dev`  | Fastify with tsx watch     |
| backend/  | `npm run build`| Compile TypeScript to dist/|
| backend/  | `npm run db:generate` | Generate Drizzle migrations (Drizzle Kit) |
| backend/  | `npm run db:migrate`  | Run Drizzle migrations against the DB   |
