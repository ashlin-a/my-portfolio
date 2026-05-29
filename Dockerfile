# syntax=docker/dockerfile:1.7

# ─── deps ──────────────────────────────────────────────────────────────────
# Install all dependencies. Cached separately from source for fast rebuilds.
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── dev ───────────────────────────────────────────────────────────────────
# Used by docker-compose.yml. Source comes in via bind mount at runtime;
# the COPY here is a fallback so the image runs standalone.
FROM deps AS dev
COPY . .
EXPOSE 4321
CMD ["bun", "run", "dev", "--host"]

# ─── builder ───────────────────────────────────────────────────────────────
# Produces ./dist for the Nginx prod stage.
FROM deps AS builder
ENV NODE_ENV=production
COPY . .
RUN bun run build

# ─── prod ──────────────────────────────────────────────────────────────────
# Static Nginx serve of dist/.
FROM nginx:alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
