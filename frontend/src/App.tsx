import { useTodos } from './hooks/useTodos'
import { LoadingState } from './components/LoadingState'
import { EmptyState } from './components/EmptyState'
import { ErrorState, DEFAULT_ERROR_MESSAGE } from './components/ErrorState'
import { TaskCard } from './components/TaskCard'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message?.trim()
    return msg !== undefined && msg !== '' ? error.message : DEFAULT_ERROR_MESSAGE
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const raw = (error as { message: unknown }).message
    const msg = typeof raw === 'string' ? raw.trim() : ''
    return msg !== '' ? msg : DEFAULT_ERROR_MESSAGE
  }
  return DEFAULT_ERROR_MESSAGE
}

function App() {
  const { data, isLoading, isError, error, refetch } = useTodos()

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <LoadingState />
      </main>
    )
  }

  if (isError) {
    return (
      <main className="min-h-screen flex flex-col">
        <ErrorState
          message={getErrorMessage(error)}
          onRetry={() => refetch().catch(() => {})}
        />
      </main>
    )
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <main className="min-h-screen flex flex-col">
        <EmptyState />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="mx-auto w-full max-w-[560px] p-6">
        <ul role="list" className="flex flex-col list-none gap-2">
          {data.map((todo, index) => (
            <TaskCard key={todo.id ?? index} todo={todo} />
          ))}
        </ul>
      </div>
    </main>
  )
}

export default App
