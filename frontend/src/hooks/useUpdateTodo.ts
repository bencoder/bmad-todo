import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTodo } from '../api/todos.js'
import { todosQueryKey } from './useTodos.js'

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({
      id,
      completed,
      description,
    }: {
      id: number
      completed?: boolean
      description?: string
    }) => {
      const payload: { completed?: boolean; description?: string } = {}
      if (completed !== undefined) payload.completed = completed
      if (description !== undefined) payload.description = description
      return updateTodo(id, payload)
    },
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
