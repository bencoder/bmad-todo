import { useTodos } from './hooks/useTodos'
import { LoadingState } from './components/LoadingState'
import { EmptyState } from './components/EmptyState'
import { ErrorState, DEFAULT_ERROR_MESSAGE } from './components/ErrorState'

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

  if (data && Array.isArray(data) && data.length === 0) {
    return (
      <main className="min-h-screen flex flex-col">
        <EmptyState />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold text-gray-900">aine-training</h1>
      <p className="mt-2 text-gray-600">Todo list (loaded). Full list UI in later stories.</p>
      {data && (
        <p className="mt-4 text-sm text-gray-500">
          {data.length === 1
            ? '1 task loaded.'
            : `${data.length} tasks loaded.`}
        </p>
      )}
    </main>
  )
}

export default App
