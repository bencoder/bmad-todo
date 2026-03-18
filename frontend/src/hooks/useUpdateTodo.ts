import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTodo } from '../api/todos.js'
import { todosQueryKey } from './useTodos.js'

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      updateTodo(id, { completed }),
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
