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

test('POST /api/todos returns 201 and created task with valid description', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { description: 'New task' },
  })
  assert.strictEqual(res.statusCode, 201)
  const body = res.json()
  assert.strictEqual(typeof body.id, 'number')
  assert.strictEqual(body.description, 'New task')
  assert.strictEqual(body.completed, false)
  assert.strictEqual(typeof body.createdAt, 'string')
  assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(body.createdAt), 'createdAt should be ISO 8601')
  const listRes = await app.inject({ method: 'GET', url: '/api/todos' })
  const list = listRes.json()
  assert.strictEqual(list.length, 1)
  assert.strictEqual(list[0].description, 'New task')
  await app.db.delete(tasks)
  await app.close()
})

test('POST /api/todos returns 400 for invalid body', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: {},
  })
  assert.strictEqual(res.statusCode, 400)
  const body = res.json()
  assert.strictEqual(body.code, 'VALIDATION_ERROR')
  assert.strictEqual(typeof body.message, 'string')
  assert.ok(/description|required|body/i.test(body.message), 'message should mention description or required')
  const listRes = await app.inject({ method: 'GET', url: '/api/todos' })
  assert.strictEqual(listRes.json().length, 0)
  await app.close()
})

test('POST /api/todos returns 400 for empty description', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { description: '' },
  })
  assert.strictEqual(res.statusCode, 400)
  const body = res.json()
  assert.strictEqual(body.code, 'VALIDATION_ERROR')
  assert.ok(/description|required|min|string/i.test(body.message), 'message should mention description or validation reason')
  const listRes = await app.inject({ method: 'GET', url: '/api/todos' })
  assert.strictEqual(listRes.json().length, 0)
  await app.close()
})

test('POST /api/todos returns 400 for whitespace-only description', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { description: '   \t  ' },
  })
  assert.strictEqual(res.statusCode, 400)
  const body = res.json()
  assert.strictEqual(body.code, 'VALIDATION_ERROR')
  assert.ok(/description|min|string/i.test(body.message), 'message should mention validation reason')
  const listRes = await app.inject({ method: 'GET', url: '/api/todos' })
  assert.strictEqual(listRes.json().length, 0)
  await app.close()
})

test('POST /api/todos returns 400 for non-string description', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { description: 123 },
  })
  assert.strictEqual(res.statusCode, 400)
  const body = res.json()
  assert.strictEqual(body.code, 'VALIDATION_ERROR')
  assert.strictEqual(typeof body.message, 'string')
  const listRes = await app.inject({ method: 'GET', url: '/api/todos' })
  assert.strictEqual(listRes.json().length, 0)
  await app.close()
})

test('POST /api/todos returns 400 for null description', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { description: null },
  })
  assert.strictEqual(res.statusCode, 400)
  const body = res.json()
  assert.strictEqual(body.code, 'VALIDATION_ERROR')
  const listRes = await app.inject({ method: 'GET', url: '/api/todos' })
  assert.strictEqual(listRes.json().length, 0)
  await app.close()
})

test('PATCH /api/todos/:id with completed true returns 200 and updated task', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { description: 'Task to complete' },
  })
  assert.strictEqual(createRes.statusCode, 201)
  const created = createRes.json()
  const id = created.id
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${id}`,
    payload: { completed: true },
  })
  assert.strictEqual(res.statusCode, 200)
  const body = res.json()
  assert.strictEqual(body.id, id)
  assert.strictEqual(body.description, 'Task to complete')
  assert.strictEqual(body.completed, true)
  assert.strictEqual(typeof body.createdAt, 'string')
  const listRes = await app.inject({ method: 'GET', url: '/api/todos' })
  const list = listRes.json()
  assert.strictEqual(list.length, 1)
  assert.strictEqual(list[0].completed, true)
  await app.close()
})

test('PATCH /api/todos/:id with completed false toggles back', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  await app.db.insert(tasks).values({ description: 'Done task', completed: true })
  const listRes = await app.inject({ method: 'GET', url: '/api/todos' })
  const list = listRes.json()
  assert.strictEqual(list.length, 1)
  const id = list[0].id
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${id}`,
    payload: { completed: false },
  })
  assert.strictEqual(res.statusCode, 200)
  const body = res.json()
  assert.strictEqual(body.completed, false)
  const listRes2 = await app.inject({ method: 'GET', url: '/api/todos' })
  assert.strictEqual(listRes2.json()[0].completed, false)
  await app.close()
})

test('PATCH /api/todos/:id returns 404 for non-existent id', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const res = await app.inject({
    method: 'PATCH',
    url: '/api/todos/99999',
    payload: { completed: true },
  })
  assert.strictEqual(res.statusCode, 404)
  const body = res.json()
  assert.strictEqual(body.code, 'NOT_FOUND')
  assert.strictEqual(body.message, 'Task not found')
  await app.close()
})

test('PATCH /api/todos/:id returns 400 for invalid body', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { description: 'Task' },
  })
  const id = createRes.json().id
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${id}`,
    payload: {},
  })
  assert.strictEqual(res.statusCode, 400)
  const body = res.json()
  assert.strictEqual(body.code, 'VALIDATION_ERROR')
  assert.strictEqual(typeof body.message, 'string')
  await app.close()
})

test('PATCH /api/todos/:id returns 400 for non-boolean completed', async () => {
  const app = await buildApp()
  await app.db.delete(tasks)
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { description: 'Task' },
  })
  const id = createRes.json().id
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${id}`,
    payload: { completed: 'yes' },
  })
  assert.strictEqual(res.statusCode, 400)
  const body = res.json()
  assert.strictEqual(body.code, 'VALIDATION_ERROR')
  await app.close()
})
