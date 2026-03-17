import { z } from 'zod'

export const taskResponseSchema = z.object({
  id: z.number(),
  description: z.string(),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
})

export const taskListResponseSchema = z.array(taskResponseSchema)
