/**
 * Todo item shape matching GET /api/todos response (camelCase, createdAt ISO 8601).
 */
export interface Todo {
  id: number
  description: string
  completed: boolean
  createdAt: string
}
