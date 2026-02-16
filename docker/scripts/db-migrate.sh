#!/bin/bash
# Run database migrations in Docker container

set -e

echo "🔄 Running database migrations..."

# Run migrations in the API container
docker-compose exec api pnpm --filter @repo/db db:migrate

echo "✅ Migrations completed"
