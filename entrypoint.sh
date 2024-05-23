#!/bin/sh
set -e

# Wait until PostgreSQL is ready
# until pg_isready -h db -U postgres; do
#   echo "Waiting for postgres..."
#   sleep 2
# done

# Output all environment variables to .env file
printenv > .env
ls -al
# # Run database migrations
# echo "Database is ready. Running migrations..."
# npx prisma migrate deploy 
# echo "Migrations complete."

# Start the application
npm start
