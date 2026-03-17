import type { db as DbInstance } from '../db/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof DbInstance
  }
}
