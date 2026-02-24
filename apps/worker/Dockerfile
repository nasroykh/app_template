
# ============================================
# Stage 1: Build - Build shared packages and Worker
# ============================================
FROM node:24-alpine AS build

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.30.1 turbo@2.8.10

WORKDIR /app

# Copy source code
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY apps/worker ./apps/worker

# Install dependencies using cached pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Build workspace packages in dependency order
RUN pnpm --filter @repo/db build
RUN pnpm --filter @repo/llm build
RUN pnpm --filter @repo/qdrant build

# Build the API (worker imports job processors from it)
RUN pnpm --filter api build

# Build the worker
RUN pnpm --filter worker build

# Prune dev dependencies for production
RUN pnpm --filter worker --prod deploy /app/pruned

# ============================================
# Stage 2: Production - Minimal runtime image
# ============================================
FROM node:24-alpine AS production

# Install postgresql-client (pg_isready) and netcat (Redis wait)
RUN apk add --no-cache postgresql-client netcat-openbsd

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S workeruser -u 1001 -G nodejs

WORKDIR /app

# Copy pruned node_modules (external dependencies)
COPY --from=build --chown=workeruser:nodejs /app/pruned/node_modules ./node_modules
COPY --from=build --chown=workeruser:nodejs /app/pruned/package.json ./package.json

# Copy worker dist
COPY --from=build --chown=workeruser:nodejs /app/apps/worker/dist ./dist

# Copy workspace package dists (referenced via node_modules symlinks)
COPY --from=build --chown=workeruser:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=workeruser:nodejs /app/packages/db/dist ./packages/db/dist
COPY --from=build --chown=workeruser:nodejs /app/packages/llm/dist ./packages/llm/dist
COPY --from=build --chown=workeruser:nodejs /app/packages/qdrant/dist ./packages/qdrant/dist

# Copy entrypoint script
COPY --chown=workeruser:nodejs apps/worker/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Switch to non-root user
USER workeruser

# Use entrypoint to wait for dependencies before starting
ENTRYPOINT ["/app/docker-entrypoint.sh"]
