import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { tasks } from '../db/schema.js'
import {
  createTaskRequestBodySchema,
  notFoundResponseSchema,
  taskListResponseSchema,
  taskResponseSchema,
  updateTaskRequestBodySchema,
  validationErrorResponseSchema,
} from '../schemas/todos.schema.js'

type CreateTaskBody = z.infer<typeof createTaskRequestBodySchema>
type UpdateTaskBody = z.infer<typeof updateTaskRequestBodySchema>

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

  app.patch('/api/todos/:id', {
    schema: {
      params: z.object({ id: z.coerce.number().refine((n) => Number.isInteger(n) && n >= 1, 'id must be a positive integer') }),
      body: updateTaskRequestBodySchema,
      response: {
        200: taskResponseSchema,
        400: validationErrorResponseSchema,
        404: notFoundResponseSchema,
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: number }
    const body = request.body as UpdateTaskBody
    const { completed, description } = body
    if (completed === undefined && description === undefined) {
      return reply.status(400).send({ code: 'VALIDATION_ERROR', message: 'At least one of completed or description is required' })
    }
    const updates: { completed?: boolean; description?: string } = {}
    if (description !== undefined) updates.description = description
    if (completed !== undefined) updates.completed = completed
    const [row] = await app.db.select().from(tasks).where(eq(tasks.id, id))
    if (!row) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Task not found' })
    }
    const [updated] = await app.db.update(tasks).set(updates).where(eq(tasks.id, id)).returning()
    if (!updated) {
      const err = new Error('Update did not return row') as Error & { code?: string; statusCode?: number }
      err.code = 'INTERNAL_ERROR'
      err.statusCode = 500
      throw err
    }
    return reply.status(200).send(toApiTask(updated))
  })

  const idParamSchema = z.object({
    id: z.coerce.number().refine((n) => Number.isInteger(n) && n >= 1, 'id must be a positive integer'),
  })

  app.delete('/api/todos/:id', {
    schema: {
      params: idParamSchema,
      response: {
        204: z.undefined(),
        404: notFoundResponseSchema,
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: number }
    const [row] = await app.db.select().from(tasks).where(eq(tasks.id, id))
    if (!row) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Task not found' })
    }
    await app.db.delete(tasks).where(eq(tasks.id, id))
    return reply.status(204).send()
  })
}

export default todosRoutes
