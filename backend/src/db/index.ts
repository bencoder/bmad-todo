import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'
import { getDbPath } from './path.js'

function ensureDirFor(path: string): void {
  if (path === ':memory:') return
  try {
    mkdirSync(dirname(path), { recursive: true })
  } catch {
    // ignore if already exists or permission error
  }
}

const path = getDbPath()
ensureDirFor(path)
const sqlite = new Database(path)
export const db = drizzle(sqlite, { schema })
