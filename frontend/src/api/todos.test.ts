import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchTodos } from './todos'

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
