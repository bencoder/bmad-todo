# Backend: Fastify + TypeScript, run with tsx in dev
# Single stage: install deps, run via tsx (no compile step for dev)

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
EXPOSE 3000

# Run with tsx for TypeScript (dev); use node dist/app.js when compiled in prod
CMD ["npm", "run", "dev"]
