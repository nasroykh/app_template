# ============================================
# Stage 1: Dependencies - Install all dependencies
# ============================================
FROM node:24-alpine AS deps

# Install pnpm
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.30.1

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files for workspace resolution
COPY apps/app/package.json ./apps/app/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json

# Install dependencies with frozen lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build - Build the application
# ============================================
FROM node:24-alpine AS build

RUN npm install -g pnpm@10.30.1 turbo@2.8.10

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages

# Copy source code
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY apps/app ./apps/app

# Build shared packages first
RUN pnpm --filter @repo/db build
RUN pnpm --filter api build

# Build the frontend application
RUN pnpm --filter app build

# ============================================
# Stage 3: Production - Nginx serving static files
# ============================================
FROM nginx:stable-alpine AS production

# Copy custom nginx configuration
COPY apps/app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from build stage
COPY --from=build /app/apps/app/dist /usr/share/nginx/html

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx-user

EXPOSE 33460

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:33460/ || exit 1

CMD ["nginx", "-g", "daemon off;"]


