import { useRef, useState } from 'react'
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
  const { mutateAsync: updateTodoAsync, mutate: updateTodo } = useUpdateTodo()
  const { mutate: deleteTodo } = useDeleteTodo()
  const addTaskClearRef = useRef<(() => void) | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const handleToggleComplete = (id: number, completed: boolean) => {
    updateTodo({ id, completed })
  }

  const handleDelete = (id: number) => {
    deleteTodo(id)
  }

  const handleStartEdit = (id: number) => {
    setEditError(null)
    setEditingId(id)
  }

  const handleSaveEdit = (id: number, description: string) => {
    const trimmed = description.trim()
    if (trimmed === '') {
      setEditError('Description required')
      return
    }
    setEditError(null)
    updateTodoAsync({ id, description: trimmed })
      .then(() => {
        setEditingId(null)
      })
      .catch((err) => {
        setEditError(getErrorMessage(err))
      })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditError(null)
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
    <div className="mx-auto w-full max-w-[560px] bg-background p-container-padding">
      <AddTaskRow
        onSubmit={handleAddSubmit}
        clearInputRef={addTaskClearRef}
        error={createErrorMessage}
        disabled={isCreating}
      />
      {!data || !Array.isArray(data) || data.length === 0 ? (
        <div className="mt-section-bottom">
          <EmptyState />
        </div>
      ) : (
        <ul role="list" className="mt-section-bottom flex flex-col list-none gap-list-gap">
          {data.map((todo, index) => (
            <TaskCard
              key={todo.id ?? index}
              todo={todo}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
              isEditing={editingId === todo.id}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              editError={editingId === todo.id ? editError ?? undefined : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
