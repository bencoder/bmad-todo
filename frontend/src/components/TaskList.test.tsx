import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskList } from './TaskList'
import * as useTodosModule from '../hooks/useTodos'

vi.mock('../hooks/useTodos')

describe('TaskList', () => {
  beforeEach(() => {
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })
  })

  it('shows LoadingState when isLoading is true', () => {
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })
    render(<TaskList />)
    expect(screen.getByText('Loading tasks')).toBeInTheDocument()
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('shows ErrorState when isError is true with message and retry', () => {
    const refetch = vi.fn(() => Promise.resolve())
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Server error'),
      refetch,
    })
    render(<TaskList />)
    expect(screen.getByText(/server error/i)).toBeInTheDocument()
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
    retryButton.click()
    expect(refetch).toHaveBeenCalled()
  })

  it('does not throw when refetch rejects on retry', () => {
    const refetch = vi.fn(() => Promise.reject(new Error('Network error')))
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Server error'),
      refetch,
    })
    expect(() => {
      render(<TaskList />)
      const retryButton = screen.getByRole('button', { name: /retry/i })
      retryButton.click()
    }).not.toThrow()
  })

  it('shows EmptyState when data is empty array', () => {
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })
    render(<TaskList />)
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
  })

  it('shows EmptyState when data is undefined', () => {
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })
    render(<TaskList />)
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
  })

  it('shows list with AddTaskRow and TaskCards when data has items', () => {
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: [
        { id: 1, description: 'First task', completed: false, createdAt: '2026-03-17T10:00:00.000Z' },
        { id: 2, description: 'Second task', completed: true, createdAt: '2026-03-16T12:00:00.000Z' },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })
    render(<TaskList />)
    expect(screen.getByPlaceholderText('Add a task')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
    expect(screen.getByText('First task')).toBeInTheDocument()
    expect(screen.getByText('Second task')).toBeInTheDocument()
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(list.closest('.max-w-\\[560px\\]')).toBeInTheDocument()
  })
})
