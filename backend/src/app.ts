import Fastify from 'fastify'
import cors from '@fastify/cors'

const app = Fastify({ logger: true })

await app.register(cors, { origin: true })

const rawPort = Number(process.env.PORT) || 3000
const port = Math.min(65535, Math.max(1, Math.floor(rawPort)))
if (port !== rawPort) {
  app.log.warn({ rawPort, port }, 'PORT out of range 1–65535; using clamped value')
}

// Health route for smoke test and connectivity (direct JSON per architecture)
app.get('/api/health', async () => {
  return { ok: true }
})

// 404 handler returns JSON
app.setNotFoundHandler((_request, reply) => {
  reply.status(404).send({ code: 'NOT_FOUND', message: 'Not Found' })
})

async function start() {
  try {
    await app.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
