import { z } from 'zod'

/** POST /api/todos body: non-empty description (trimmed). */
export const createTaskRequestBodySchema = z.object({
  description: z.string().trim().min(1),
})

export const taskResponseSchema = z.object({
  id: z.number(),
  description: z.string(),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
})

export const taskListResponseSchema = z.array(taskResponseSchema)
