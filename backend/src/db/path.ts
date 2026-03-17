/**
 * Single source of truth for DB path/URL. Used by db/index.ts (runtime) and drizzle.config.ts (CLI).
 * Supports DB_PATH, DATABASE_URL=file:path, DATABASE_URL=:memory:, or default ./data/todos.db.
 */
export function getDbPath(): string {
  const dbPath = process.env.DB_PATH
  if (dbPath) return dbPath
  const url = process.env.DATABASE_URL
  if (url === ':memory:') return ':memory:'
  if (url?.startsWith('file:')) {
    const p = url.slice(5).trim()
    return p || './data/todos.db'
  }
  return './data/todos.db'
}
