import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTodo } from '../api/todos.js'
import { todosQueryKey } from './useTodos.js'

export function useCreateTodo() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (description: string) => createTodo(description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKey })
    },
  })
  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
