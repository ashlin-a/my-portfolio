# Base stage: Installs dependencies
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Development stage: targeted by docker-compose.yml
# We copy source here so the image is self-contained if run standalone,
# but compose will overwrite with a bind mount for live editing.
FROM base AS dev
COPY . .
EXPOSE 4321
CMD ["bun", "run", "dev", "--host"]

# Builder stage: Builds the production site
FROM base AS builder
COPY . .
RUN bun run build

# Production stage: Serves with Nginx
FROM nginx:alpine AS prod
# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]