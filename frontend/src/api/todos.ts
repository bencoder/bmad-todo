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
