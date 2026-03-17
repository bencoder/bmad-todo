import type { FastifyInstance } from 'fastify'
import { tasks } from '../db/schema.js'
import { taskListResponseSchema } from '../schemas/todos.schema.js'

function toApiTask(row: { id: number; description: string; completed: boolean; created_at: Date | null; user_id: number | null }) {
  return {
    id: row.id,
    description: row.description,
    completed: row.completed,
    createdAt: row.created_at != null ? row.created_at.toISOString() : '',
  }
}

async function todosRoutes(app: FastifyInstance) {
  app.get('/api/todos', {
    schema: {
      response: {
        200: taskListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    const rows = await app.db.select().from(tasks)
    const body = rows.map(toApiTask)
    return reply.send(body)
  })
}

export default todosRoutes
