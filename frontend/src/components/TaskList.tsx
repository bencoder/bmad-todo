import { useTodos } from '../hooks/useTodos'
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

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="mx-auto w-full max-w-[560px] p-6">
      <AddTaskRow />
      <ul role="list" className="mt-4 flex flex-col list-none gap-2">
        {data.map((todo, index) => (
          <TaskCard key={todo.id ?? index} todo={todo} />
        ))}
      </ul>
    </div>
  )
}
