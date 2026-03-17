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

  it('shows loading state while fetch is in progress', async () => {
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>(() => {
        /* never resolves so query stays loading */
      })
    )
    renderApp()
    await waitFor(() => {
      expect(screen.getByText('Loading tasks')).toBeInTheDocument()
    })
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

  it('when fetch returns empty array, shows empty state and add affordance and called /api/todos', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)
    renderApp()
    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/todos$/))
    const addButton = screen.getByRole('button', { name: /add your first task/i })
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveAttribute('type', 'button')
    expect(addButton).not.toHaveAttribute('tabIndex', '-1')
    addButton.focus()
    expect(document.activeElement).toBe(addButton)
  })

  it('does not show empty state while loading', async () => {
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>(() => {
        /* never resolves */
      })
    )
    renderApp()
    await waitFor(() => {
      expect(screen.getByText('Loading tasks')).toBeInTheDocument()
    })
    expect(screen.queryByText(/no tasks yet/i)).not.toBeInTheDocument()
  })
})
