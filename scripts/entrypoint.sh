#!/bin/sh
set -e

PRISMA="./node_modules/.bin/prisma"

echo "Waiting for database to be ready..."
MAX_RETRIES=30
RETRY=0
until echo "SELECT 1" | $PRISMA db execute --stdin > /dev/null 2>&1 || [ "$RETRY" -ge "$MAX_RETRIES" ]; do
  RETRY=$((RETRY + 1))
  echo "Database not ready yet (attempt $RETRY/$MAX_RETRIES)..."
  sleep 2
done

if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
  echo "Warning: Could not verify database connection, proceeding anyway..."
fi

echo "Running database migrations..."
$PRISMA migrate deploy

echo "Starting application..."
exec node server.js
