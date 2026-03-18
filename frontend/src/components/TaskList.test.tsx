import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskList } from './TaskList'
import * as useTodosModule from '../hooks/useTodos'
import * as useCreateTodoModule from '../hooks/useCreateTodo'
import * as useUpdateTodoModule from '../hooks/useUpdateTodo'
import * as useDeleteTodoModule from '../hooks/useDeleteTodo'

vi.mock('../hooks/useTodos')
vi.mock('../hooks/useCreateTodo')
vi.mock('../hooks/useUpdateTodo')
vi.mock('../hooks/useDeleteTodo')

function renderTaskList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <TaskList />
    </QueryClientProvider>,
  )
}

describe('TaskList', () => {
  beforeEach(() => {
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })
    vi.mocked(useCreateTodoModule.useCreateTodo).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
    })
    vi.mocked(useUpdateTodoModule.useUpdateTodo).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
    })
    vi.mocked(useDeleteTodoModule.useDeleteTodo).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
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
    renderTaskList()
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
    renderTaskList()
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
      renderTaskList()
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
    renderTaskList()
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add a task')).toBeInTheDocument()
  })

  it('shows EmptyState when data is undefined', () => {
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })
    renderTaskList()
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add a task')).toBeInTheDocument()
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
    renderTaskList()
    expect(screen.getByPlaceholderText('Add a task')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
    expect(screen.getByText('First task')).toBeInTheDocument()
    expect(screen.getByText('Second task')).toBeInTheDocument()
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(list.closest('.max-w-\\[560px\\]')).toBeInTheDocument()
  })

  it('calls create mutation with trimmed description on submit and clears input on success', async () => {
    const initialData: Array<{ id: number; description: string; completed: boolean; createdAt: string }> = []
    const refetch = vi.fn(() => Promise.resolve())
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: initialData,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useCreateTodoModule.useCreateTodo).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
    })
    renderTaskList()
    const input = screen.getByRole('textbox', { name: /add a task/i })
    const form = input.closest('form')
    fireEvent.change(input, { target: { value: '  New task  ' } })
    fireEvent.submit(form!)
    expect(mutateAsync).toHaveBeenCalledWith('New task')
    await waitFor(() => {
      expect(input).toHaveValue('')
    })
    // After success, list would refetch; simulate list including the new task
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: [{ id: 99, description: 'New task', completed: false, createdAt: '2026-03-17T12:00:00.000Z' }],
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    })
    renderTaskList()
    expect(screen.getByText('New task')).toBeInTheDocument()
  })

  it('shows inline error when create mutation fails and does not clear input', async () => {
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Server error'))
    vi.mocked(useCreateTodoModule.useCreateTodo).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
      isError: true,
      error: new Error('Couldn\'t add task'),
    })
    renderTaskList()
    const input = screen.getByRole('textbox', { name: /add a task/i })
    fireEvent.change(input, { target: { value: 'My task' } })
    expect(input).toHaveValue('My task')
    const form = input.closest('form')
    fireEvent.submit(form!)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/couldn't add task/i)
    })
    expect(input).toHaveValue('My task')
  })

  it('calls update mutation with id and completed when checkbox is toggled', () => {
    const updateMutate = vi.fn()
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
    vi.mocked(useUpdateTodoModule.useUpdateTodo).mockReturnValue({
      mutate: updateMutate,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
    })
    renderTaskList()
    const firstCheckbox = screen.getByRole('checkbox', { name: /mark task complete/i })
    expect(firstCheckbox).not.toBeChecked()
    fireEvent.click(firstCheckbox)
    expect(updateMutate).toHaveBeenCalledTimes(1)
    expect(updateMutate).toHaveBeenCalledWith({ id: 1, completed: true })
  })

  it('toggle on completed task calls update with completed false', () => {
    const updateMutate = vi.fn()
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: [
        { id: 2, description: 'Done task', completed: true, createdAt: '2026-03-16T12:00:00.000Z' },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })
    vi.mocked(useUpdateTodoModule.useUpdateTodo).mockReturnValue({
      mutate: updateMutate,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
    })
    renderTaskList()
    const checkbox = screen.getByRole('checkbox', { name: /mark task active/i })
    fireEvent.click(checkbox)
    expect(updateMutate).toHaveBeenCalledWith({ id: 2, completed: false })
  })

  it('calls delete mutation with task id when delete button is clicked', () => {
    const deleteMutate = vi.fn()
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
    vi.mocked(useDeleteTodoModule.useDeleteTodo).mockReturnValue({
      mutate: deleteMutate,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
    })
    renderTaskList()
    const deleteButtons = screen.getAllByRole('button', { name: /delete task/i })
    expect(deleteButtons).toHaveLength(2)
    fireEvent.click(deleteButtons[1])
    expect(deleteMutate).toHaveBeenCalledTimes(1)
    expect(deleteMutate).toHaveBeenCalledWith(2)
  })

  it('does not call create when submitted description is empty after trim', () => {
    vi.mocked(useTodosModule.useTodos).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(() => Promise.resolve()),
    })
    const mutateAsync = vi.fn()
    vi.mocked(useCreateTodoModule.useCreateTodo).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
    })
    renderTaskList()
    const input = screen.getByRole('textbox', { name: /add a task/i })
    const form = input.closest('form')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(form!)
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
