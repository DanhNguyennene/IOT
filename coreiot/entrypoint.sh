#!/bin/sh

# Wait for MongoDB to be ready
# echo "Waiting for MongoDB to start..."
# until mongosh --host mongo --eval "db.runCommand({ ping: 1 })" > /dev/null 2>&1; do
#   echo "MongoDB is unavailable - sleeping"
#   sleep 5
# done

echo "coreiot service is up"

# Run schema_gen.py to initialize the database
# python /app/src/schema_gen.py

# Start the application server
exec uvicorn main:app --host "$HOST"  --port 8050