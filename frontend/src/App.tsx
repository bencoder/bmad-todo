import { useTodos } from './hooks/useTodos'
import { LoadingState } from './components/LoadingState'
import { EmptyState } from './components/EmptyState'

function App() {
  const { data, isLoading } = useTodos()

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <LoadingState />
      </main>
    )
  }

  if (!isLoading && data && Array.isArray(data) && data.length === 0) {
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
