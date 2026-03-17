import type { FastifyInstance } from 'fastify'
import type { z } from 'zod'
import { tasks } from '../db/schema.js'
import {
  createTaskRequestBodySchema,
  taskListResponseSchema,
  taskResponseSchema,
} from '../schemas/todos.schema.js'

type CreateTaskBody = z.infer<typeof createTaskRequestBodySchema>

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

  app.post('/api/todos', {
    schema: {
      body: createTaskRequestBodySchema,
      response: {
        201: taskResponseSchema,
      },
    },
  }, async (request, reply) => {
    const body = request.body as CreateTaskBody
    const { description } = body
    try {
      const [row] = await app.db.insert(tasks).values({ description }).returning()
      if (!row) {
        const err = new Error('Insert did not return row') as Error & { code?: string; statusCode?: number }
        err.code = 'INTERNAL_ERROR'
        err.statusCode = 500
        throw err
      }
      return reply.status(201).send(toApiTask(row))
    } catch (err: unknown) {
      const e = err as { code?: string; statusCode?: number }
      if (e.code != null && e.statusCode != null) throw err
      const internal = new Error('Internal Server Error') as Error & { code?: string; statusCode?: number }
      internal.code = 'INTERNAL_ERROR'
      internal.statusCode = 500
      throw internal
    }
  })
}

export default todosRoutes
