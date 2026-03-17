import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      )
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows loading state while fetch is in progress', () => {
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>(() => {
        /* never resolves so query stays loading */
      })
    )
    renderApp()
    expect(screen.getByText('Loading tasks')).toBeInTheDocument()
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('shows content when fetch succeeds', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: 1, description: 'Task one', completed: false, createdAt: '2025-01-01T00:00:00.000Z' },
        ]),
    } as Response)
    renderApp()
    await waitFor(() => {
      expect(screen.getByText(/aine-training/)).toBeInTheDocument()
    })
    expect(screen.getByText('1 task loaded.')).toBeInTheDocument()
    expect(screen.queryByText('Loading tasks')).not.toBeInTheDocument()
  })

  it('calls fetch with /api/todos URL', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)
    renderApp()
    await waitFor(() => {
      expect(screen.getByText(/aine-training/)).toBeInTheDocument()
    })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/todos$/))
  })
})
