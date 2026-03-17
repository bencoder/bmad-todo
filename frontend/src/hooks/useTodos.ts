import { useQuery } from '@tanstack/react-query'
import { fetchTodos } from '../api/todos.js'

export const todosQueryKey = ['todos'] as const

export function useTodos() {
  const result = useQuery({
    queryKey: todosQueryKey,
    queryFn: fetchTodos,
  })
  return {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  }
}
