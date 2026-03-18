import type { Todo } from '../types/todo.js'

const raw = import.meta.env.VITE_API_URL ?? ''
const API_BASE = typeof raw === 'string' ? raw.replace(/\/+$/, '') : ''

function getTodosUrl(): string {
  const base = API_BASE || ''
  return base ? `${base}/api/todos` : '/api/todos'
}

/**
 * Fetches todos from GET /api/todos.
 * Uses VITE_API_URL + /api/todos; throws on non-2xx so TanStack Query can treat as error.
 */
export async function fetchTodos(): Promise<Todo[]> {
  const url = getTodosUrl()
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = typeof body?.message === 'string' ? body.message : res.statusText
    throw new Error(message)
  }
  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new Error('Invalid response: not JSON')
  }
  return Array.isArray(data) ? data : []
}

/**
 * Creates a todo via POST /api/todos.
 * Body: { description }. Returns created task (camelCase Todo shape).
 * Throws on non-2xx with body.message or statusText.
 */
export async function createTodo(description: string): Promise<Todo> {
  const desc = typeof description === 'string' ? description.trim() : ''
  if (desc === '') {
    throw new Error('Description required')
  }
  const url = getTodosUrl()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: desc }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = typeof body?.message === 'string' ? body.message : res.statusText
    throw new Error(message)
  }
  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new Error('Invalid response: not JSON')
  }
  if (data == null || typeof data !== 'object' || !('id' in data) || !('description' in data)) {
    throw new Error('Invalid response: expected task object')
  }
  const obj = data as Record<string, unknown>
  const id = Number(obj.id)
  if (Number.isNaN(id) || id < 0) {
    throw new Error('Invalid response: id must be a non-negative number')
  }
  return {
    id,
    description: String(obj.description),
    completed: Boolean(obj.completed),
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : '',
  }
}

/**
 * Updates a todo's completed state via PATCH /api/todos/:id.
 * Body: { completed }. Returns updated task (camelCase Todo shape).
 * Throws on non-2xx with body.message or statusText.
 */
export async function updateTodo(id: number, payload: { completed: boolean }): Promise<Todo> {
  const base = getTodosUrl()
  const url = `${base}/${id}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: payload.completed }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = typeof body?.message === 'string' ? body.message : res.statusText
    throw new Error(message)
  }
  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new Error('Invalid response: not JSON')
  }
  if (data == null || typeof data !== 'object' || !('id' in data) || !('description' in data)) {
    throw new Error('Invalid response: expected task object')
  }
  const obj = data as Record<string, unknown>
  const taskId = Number(obj.id)
  if (Number.isNaN(taskId) || taskId < 0) {
    throw new Error('Invalid response: id must be a non-negative number')
  }
  return {
    id: taskId,
    description: String(obj.description),
    completed: Boolean(obj.completed),
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : '',
  }
}
