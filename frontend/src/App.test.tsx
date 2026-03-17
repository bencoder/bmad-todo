import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response)
      )
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders app title', async () => {
    render(<App />)
    expect(screen.getByText(/aine-training/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/Backend:/)).toBeInTheDocument()
    })
  })

  it('shows backend reachable when health succeeds', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/Reachable/)).toBeInTheDocument()
    })
  })

  it('shows not reachable when health fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network error')))
    )
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/Not reachable/)).toBeInTheDocument()
    })
  })
})
