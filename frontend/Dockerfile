# Frontend: Vite dev server (default) or production build with nginx
# For local/docker-compose: runs Vite dev server.
# For prod: use multi-stage build (build stage + nginx) in a later story.

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
EXPOSE 5173

# Dev: run Vite dev server (host can use VITE_API_URL to point to backend)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
