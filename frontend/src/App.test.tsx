import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

/** Minimal fetch response shape used by fetchTodos (ok, json). Avoids casting to Response. */
function mockJsonResponse(ok: boolean, body: object, status = 200) {
  return { ok, status, json: () => Promise.resolve(body) }
}

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
      vi.fn(() => Promise.resolve(mockJsonResponse(true, [])))
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
    vi.mocked(fetch).mockResolvedValue(
      mockJsonResponse(true, [
        { id: 1, description: 'Task one', completed: false, createdAt: '2025-01-01T00:00:00.000Z' },
      ])
    )
    renderApp()
    await waitFor(() => {
      expect(screen.getByText(/aine-training/)).toBeInTheDocument()
    })
    expect(screen.getByText('1 task loaded.')).toBeInTheDocument()
    expect(screen.queryByText('Loading tasks')).not.toBeInTheDocument()
  })

  it('when fetch returns empty array, shows empty state and add affordance and called /api/todos', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValue(mockJsonResponse(true, []))
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

  it('when fetch fails, shows error state with message and Retry button', async () => {
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(false, { message: 'Server error' }, 500))
    renderApp()
    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
    expect(retryButton).not.toHaveAttribute('tabIndex', '-1')
    retryButton.focus()
    expect(document.activeElement).toBe(retryButton)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/server error/i)
  })

  it('when fetch fails with no body message, shows default error message and Retry', async () => {
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(false, {}, 500))
    renderApp()
    await waitFor(() => {
      expect(screen.getByText(/couldn't load tasks/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('when in error state, clicking Retry triggers refetch and shows list on success', async () => {
    let callCount = 0
    vi.mocked(fetch).mockImplementation(() => {
      callCount += 1
      if (callCount === 1) {
        return Promise.resolve(mockJsonResponse(false, { message: 'Unavailable' }, 503))
      }
      return Promise.resolve(
        mockJsonResponse(true, [
          { id: 1, description: 'Task one', completed: false, createdAt: '2025-01-01T00:00:00.000Z' },
        ])
      )
    })
    renderApp()
    await waitFor(() => {
      expect(screen.getByText(/unavailable/i)).toBeInTheDocument()
    })
    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)
    await waitFor(() => {
      expect(screen.getByText('1 task loaded.')).toBeInTheDocument()
    })
    expect(screen.queryByText(/unavailable/i)).not.toBeInTheDocument()
    expect(callCount).toBe(2)
  })
})
