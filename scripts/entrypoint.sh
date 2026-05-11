#!/bin/sh
set -e

echo "Waiting for database to be ready..."
MAX_RETRIES=30
RETRY=0
until echo "SELECT 1" | npx prisma db execute --stdin > /dev/null 2>&1 || [ "$RETRY" -ge "$MAX_RETRIES" ]; do
  RETRY=$((RETRY + 1))
  echo "Database not ready yet (attempt $RETRY/$MAX_RETRIES)..."
  sleep 2
done

if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
  echo "Warning: Could not verify database connection, proceeding anyway..."
fi

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec node server.js
