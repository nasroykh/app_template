#!/bin/sh
set -e

echo "🚀 Starting API container..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run migrations automatically in production
if [ "$NODE_ENV" = "production" ]; then
  echo "🔄 Running database migrations..."
  cd /app/packages/db && npx drizzle-kit migrate --config drizzle.config.ts || {
    echo "❌ Migration failed!"
    exit 1
  }
  echo "✅ Migrations completed successfully!"
fi

# Start the application
echo "🎯 Starting application..."
cd /app
exec node dist/index.js
