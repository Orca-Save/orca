#!/bin/sh

# Wait until PostgreSQL is ready
until pg_isready -h db -U postgres; do
  echo "Waiting for postgres..."
  sleep 2
done

# Run database migrations
echo "Database is ready. Running migrations..."
npx prisma migrate deploy 
echo "Migrations complete."

# Start the application
npm start
