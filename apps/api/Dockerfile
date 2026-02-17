# ============================================
# Stage 1: Dependencies - Install all dependencies
# ============================================
FROM node:24-alpine AS deps

# Install pnpm
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.0.0

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files for workspace resolution
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json

# Install dependencies with frozen lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build - Build shared packages and API
# ============================================
FROM node:24-alpine AS build

RUN npm install -g pnpm@10.0.0 turbo@2.5.4

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages

# Copy source code
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Build the database package first (dependency)
RUN pnpm --filter @repo/db build

# Build the API
RUN pnpm --filter api build

# Prune dev dependencies for production
RUN pnpm --filter api --prod deploy /app/pruned

# ============================================
# Stage 3: Production - Minimal runtime image
# ============================================
FROM node:24-alpine AS production

# Install PostgreSQL client for pg_isready and pnpm for migrations
RUN apk add --no-cache postgresql-client && \
    npm install -g pnpm@10.0.0

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apiuser -u 1001 -G nodejs

WORKDIR /app

# Copy workspace configuration for migration support
COPY --chown=apiuser:nodejs pnpm-workspace.yaml package.json ./
COPY --chown=apiuser:nodejs packages/db/package.json ./packages/db/package.json

# Copy built application from build stage
COPY --from=build --chown=apiuser:nodejs /app/pruned/node_modules ./node_modules
COPY --from=build --chown=apiuser:nodejs /app/pruned/package.json ./apps/api/package.json
COPY --from=build --chown=apiuser:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=apiuser:nodejs /app/packages/db/dist ./packages/db/dist
COPY --from=build --chown=apiuser:nodejs /app/packages/db/src ./packages/db/src
COPY --from=build --chown=apiuser:nodejs /app/packages/db/drizzle.config.ts ./packages/db/drizzle.config.ts

# Install drizzle-kit for migrations (production only needs this)
RUN pnpm --filter @repo/db add -D drizzle-kit

# Copy entrypoint script
COPY --chown=apiuser:nodejs apps/api/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Switch to non-root user
USER apiuser

# Expose API port
EXPOSE 33450

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:33450/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Use entrypoint script to run migrations before starting
ENTRYPOINT ["/app/docker-entrypoint.sh"]


