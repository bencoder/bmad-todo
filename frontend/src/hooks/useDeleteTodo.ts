import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTodo } from '../api/todos.js'
import { todosQueryKey } from './useTodos.js'

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
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
