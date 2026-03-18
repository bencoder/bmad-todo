import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './todos'

describe('fetchTodos', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls fetch with VITE_API_URL + /api/todos', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)
    await fetchTodos()
    const base = (import.meta.env.VITE_API_URL ?? '').toString().replace(/\/+$/, '')
    const expectedUrl = base ? `${base}/api/todos` : '/api/todos'
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('returns parsed array on 200', async () => {
    const todos = [
      { id: 1, description: 'a', completed: false, createdAt: '2025-01-01T00:00:00.000Z' },
    ]
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(todos),
    } as Response)
    const result = await fetchTodos()
    expect(result).toEqual(todos)
  })

  it('throws when response body is not valid JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('Unexpected token')),
    } as Response)
    await expect(fetchTodos()).rejects.toThrow('Invalid response: not JSON')
  })

  it('throws on non-2xx so TanStack Query can treat as error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ code: 'ERR', message: 'Server error' }),
    } as Response)
    await expect(fetchTodos()).rejects.toThrow('Server error')
  })
})

describe('createTodo', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('POSTs { description } to /api/todos and returns created task', async () => {
    const created = {
      id: 1,
      description: 'New task',
      completed: false,
      createdAt: '2026-03-17T12:00:00.000Z',
    }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve(created),
    } as Response)
    const result = await createTodo('New task')
    expect(result).toEqual(created)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/todos'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'New task' }),
      }),
    )
  })

  it('trims description before sending', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 1, description: 'x', completed: false, createdAt: '' }),
    } as Response)
    await createTodo('  x  ')
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ description: 'x' }) }),
    )
  })

  it('throws on non-2xx with body.message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ code: 'VALIDATION_ERROR', message: 'Description required' }),
    } as Response)
    await expect(createTodo('')).rejects.toThrow('Description required')
  })

  it('throws with statusText when response body has no message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    } as Response)
    await expect(createTodo('x')).rejects.toThrow('Internal Server Error')
  })
})

describe('updateTodo', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('PATCHes { completed } to /api/todos/:id and returns updated task', async () => {
    const updated = {
      id: 1,
      description: 'Task',
      completed: true,
      createdAt: '2026-03-17T12:00:00.000Z',
    }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(updated),
    } as Response)
    const result = await updateTodo(1, { completed: true })
    expect(result).toEqual(updated)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/todos\/1$/),
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      }),
    )
  })

  it('throws on non-2xx with body.message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ code: 'NOT_FOUND', message: 'Task not found' }),
    } as Response)
    await expect(updateTodo(99999, { completed: true })).rejects.toThrow('Task not found')
  })

  it('throws with statusText when response body has no message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    } as Response)
    await expect(updateTodo(1, { completed: false })).rejects.toThrow('Internal Server Error')
  })
})

describe('deleteTodo', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends DELETE to /api/todos/:id and returns void on 204', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 204,
    } as Response)
    await deleteTodo(1)
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/todos\/1$/), {
      method: 'DELETE',
    })
  })

  it('throws on 404 with body.message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ code: 'NOT_FOUND', message: 'Task not found' }),
    } as Response)
    await expect(deleteTodo(99999)).rejects.toThrow('Task not found')
  })

  it('throws on non-2xx with statusText when body has no message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    } as Response)
    await expect(deleteTodo(1)).rejects.toThrow('Internal Server Error')
  })
})
