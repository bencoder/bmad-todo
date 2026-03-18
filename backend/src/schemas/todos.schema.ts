import { z } from 'zod'

/** POST /api/todos body: non-empty description (trimmed). */
export const createTaskRequestBodySchema = z.object({
  description: z.string().trim().min(1),
})

/** PATCH /api/todos/:id body: completed flag. */
export const updateTaskRequestBodySchema = z.object({
  completed: z.boolean(),
})

export const taskResponseSchema = z.object({
  id: z.number(),
  description: z.string(),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
})

export const taskListResponseSchema = z.array(taskResponseSchema)

/** 404 error body. */
export const notFoundResponseSchema = z.object({
  code: z.literal('NOT_FOUND'),
  message: z.string(),
})
