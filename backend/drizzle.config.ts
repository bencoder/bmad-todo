import { defineConfig } from 'drizzle-kit'
import { getDbPath } from './src/db/path.js'

export default defineConfig({
  // Drizzle Kit uses dialect (not driver) for sqlite in current API
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: getDbPath() },
  breakpoints: true,
})
