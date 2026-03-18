import { z } from 'zod'

/** POST /api/todos body: non-empty description (trimmed). */
export const createTaskRequestBodySchema = z.object({
  description: z.string().trim().min(1),
})

/** PATCH /api/todos/:id body: at least one of completed or description. */
export const updateTaskRequestBodySchema = z
  .object({
    completed: z.boolean().optional(),
    description: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.completed !== undefined || data.description !== undefined, {
    message: 'At least one of completed or description is required',
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

/** 400 validation error body. */
export const validationErrorResponseSchema = z.object({
  code: z.literal('VALIDATION_ERROR'),
  message: z.string(),
})
