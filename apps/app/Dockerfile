# ============================================
# Stage 1: Build - Build the application
# ============================================
FROM node:24-alpine AS build

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.30.1 turbo@2.8.10

WORKDIR /app

# Copy source code
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY apps/app ./apps/app

# Install dependencies using cached pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Build shared packages first
RUN pnpm --filter @repo/db build
RUN pnpm --filter api build

# Build arg for API URL — must be set at build time (Vite bakes it into the bundle)
ARG VITE_API_URL=http://localhost:33450/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Build the frontend application
RUN pnpm --filter app build

# ============================================
# Stage 2: Production - Caddy serving static files
# ============================================
FROM caddy:2-alpine AS production

# Copy Caddyfile
COPY apps/app/Caddyfile /etc/caddy/Caddyfile

# Copy built static files from build stage
COPY --from=build /app/apps/app/dist /srv

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser && \
    chown -R appuser:appuser /srv && \
    chown -R appuser:appuser /config && \
    chown -R appuser:appuser /data && \
    chmod -R 755 /srv

# Switch to non-root user
USER appuser

EXPOSE 33460

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:33460/health || exit 1

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
