import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { db } from './db/index.js'
import todosRoutes from './routes/todos.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.setSchemaErrorFormatter((errors, dataVar) => {
    const fallback = 'Validation failed'
    const msg =
      errors.length === 0
        ? fallback
        : errors
            .map((e: { instancePath?: string; message?: string; keyword?: string; params?: unknown }) => {
              const path = [dataVar, e.instancePath].filter(Boolean).join('')
              const part = [path, e.message].filter(Boolean).join(' ').trim()
              return part || fallback
            })
            .join(', ')
            .trim() || fallback
    const err = new Error(msg) as Error & { code?: string; statusCode?: number }
    err.code = 'VALIDATION_ERROR'
    err.statusCode = 400
    return err
  })
  app.decorate('db', db)

  await app.register(cors, { origin: true })
  await app.register(todosRoutes)

  // Health route for smoke test and connectivity (direct JSON per architecture)
  app.get('/api/health', async () => {
    return { ok: true }
  })

  // 404 handler returns JSON
  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ code: 'NOT_FOUND', message: 'Not Found' })
  })

  // Errors (validation, server) return JSON { code, message }
  app.setErrorHandler((err: unknown, request, reply) => {
    const e = err as { code?: string; message?: string; statusCode?: number }
    const isValidation = e.code === 'FST_ERR_VALIDATION' || e.code === 'VALIDATION_ERROR'
    const code = isValidation ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'
    const message = isValidation ? (e.message ?? 'Validation failed') : 'Internal Server Error'
    const status = e.statusCode ?? (code === 'VALIDATION_ERROR' ? 400 : 500)
    if (!isValidation) request.log.error({ err }, 'Server error')
    reply.status(status).send({ code, message })
  })

  return app
}

async function start() {
  const app = await buildApp()
  const rawPort = Number(process.env.PORT) || 3000
  const port = rawPort === 0 ? 0 : Math.min(65535, Math.max(1, Math.floor(rawPort)))
  if (rawPort !== 0 && port !== rawPort) {
    app.log.warn({ rawPort, port }, 'PORT out of range 1–65535; using clamped value')
  }
  try {
    await app.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// Only listen when not in test (so tests can import buildApp without starting the server)
if (!process.env.TEST) {
  start().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
