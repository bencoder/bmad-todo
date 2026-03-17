import assert from 'node:assert'
import { join } from 'node:path'
import { test } from 'node:test'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

// Use in-memory DB so tests don't touch the file-based DB
process.env.DATABASE_URL = ':memory:'

const { db } = await import('../src/db/index.js')
const { buildApp } = await import('../src/app.js')
const { tasks } = await import('../src/db/schema.js')

migrate(db, { migrationsFolder: join(process.cwd(), 'drizzle') })

test('GET /api/todos returns 200 with empty array when no tasks', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const res = await app.inject({ method: 'GET', url: '/api/todos' })
  assert.strictEqual(res.statusCode, 200)
  const body = res.json()
  assert.ok(Array.isArray(body))
  assert.strictEqual(body.length, 0)
  await app.close()
})

test('GET /api/todos returns 200 with array of tasks when tasks exist', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  await app.db.insert(tasks).values([
    { description: 'Task one', completed: false },
    { description: 'Task two', completed: true },
  ])
  const res = await app.inject({ method: 'GET', url: '/api/todos' })
  assert.strictEqual(res.statusCode, 200)
  const body = res.json()
  assert.ok(Array.isArray(body))
  assert.strictEqual(body.length, 2)
  await app.close()
})

test('GET /api/todos task shape: camelCase, ISO 8601 createdAt', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  await app.db.insert(tasks).values({ description: 'Shape test', completed: false })
  const res = await app.inject({ method: 'GET', url: '/api/todos' })
  assert.strictEqual(res.statusCode, 200)
  const body = res.json()
  assert.strictEqual(body.length, 1)
  const task = body[0]
  assert.strictEqual(typeof task.id, 'number')
  assert.strictEqual(task.description, 'Shape test')
  assert.strictEqual(task.completed, false)
  assert.strictEqual(typeof task.createdAt, 'string')
  assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(task.createdAt), 'createdAt should be ISO 8601')
  await app.close()
})

test('404 returns JSON { code, message }', async () => {
  const app = await buildApp()
  const res = await app.inject({ method: 'GET', url: '/api/nonexistent' })
  assert.strictEqual(res.statusCode, 404)
  const body = res.json()
  assert.strictEqual(body.code, 'NOT_FOUND')
  assert.strictEqual(typeof body.message, 'string')
  await app.close()
})

test('5xx returns JSON { code, message }', async () => {
  const app = await buildApp()
  app.get('/api/throw-test', async () => {
    throw new Error('Intentional test error')
  })
  const res = await app.inject({ method: 'GET', url: '/api/throw-test' })
  assert.strictEqual(res.statusCode, 500)
  const body = res.json()
  assert.strictEqual(body.code, 'INTERNAL_ERROR')
  assert.strictEqual(typeof body.message, 'string')
  await app.close()
})
