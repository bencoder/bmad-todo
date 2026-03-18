import { useRef } from 'react'
import { useTodos } from '../hooks/useTodos'
import { useCreateTodo } from '../hooks/useCreateTodo'
import { useUpdateTodo } from '../hooks/useUpdateTodo'
import { useDeleteTodo } from '../hooks/useDeleteTodo'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ErrorState, DEFAULT_ERROR_MESSAGE } from './ErrorState'
import { AddTaskRow } from './AddTaskRow'
import { TaskCard } from './TaskCard'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message?.trim()
    return msg !== undefined && msg !== '' ? msg : DEFAULT_ERROR_MESSAGE
  }
  if (typeof error === 'string') {
    const t = error.trim()
    return t !== '' ? t : DEFAULT_ERROR_MESSAGE
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const raw = (error as { message: unknown }).message
    const msg = typeof raw === 'string' ? raw.trim() : ''
    return msg !== '' ? msg : DEFAULT_ERROR_MESSAGE
  }
  return DEFAULT_ERROR_MESSAGE
}

export function TaskList() {
  const { data, isLoading, isError, error, refetch } = useTodos()
  const { mutateAsync: createTodo, isPending: isCreating, isError: isCreateError, error: createError } = useCreateTodo()
  const { mutate: updateTodo } = useUpdateTodo()
  const { mutate: deleteTodo } = useDeleteTodo()
  const addTaskClearRef = useRef<(() => void) | null>(null)

  const handleToggleComplete = (id: number, completed: boolean) => {
    updateTodo({ id, completed })
  }

  const handleDelete = (id: number) => {
    deleteTodo(id)
  }

  const handleAddSubmit = (trimmedDescription: string) => {
    if (trimmedDescription === '') return
    createTodo(trimmedDescription)
      .then(() => addTaskClearRef.current?.())
      .catch((err) => {
        console.error('Create task failed:', err)
      })
  }

  const createErrorMessage = isCreateError && createError ? getErrorMessage(createError) : undefined

  // Loading takes precedence when both isLoading and isError are true (e.g. refetch-after-error).
  if (isLoading) {
    return <LoadingState />
  }

  if (isError) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() =>
          refetch().catch((err) => {
            console.error('Retry failed:', err)
          })
        }
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-[560px] p-6">
      <AddTaskRow
        onSubmit={handleAddSubmit}
        clearInputRef={addTaskClearRef}
        error={createErrorMessage}
        disabled={isCreating}
      />
      {!data || !Array.isArray(data) || data.length === 0 ? (
        <div className="mt-4">
          <EmptyState />
        </div>
      ) : (
        <ul role="list" className="mt-4 flex flex-col list-none gap-2">
          {data.map((todo, index) => (
            <TaskCard
              key={todo.id ?? index}
              todo={todo}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
