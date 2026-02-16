#!/bin/bash
# Clean up Docker resources

set -e

echo "🧹 Cleaning up Docker resources..."

# Stop and remove containers
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Prune unused resources
docker system prune -f

echo "✅ Cleanup completed"
