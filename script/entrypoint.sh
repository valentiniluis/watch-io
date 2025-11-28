#!/bin/sh

until nc -z $PG_HOST $PG_PORT; do
  sleep 1
done

echo "--------------------------------------------------------"
echo "Starting movie ingestion script..."
echo "--------------------------------------------------------"

python3 data-ingestion.py

if [ $? -eq 0 ]; then
  echo "Ingestion sucessful. Shutting down container..."
  exit 0
else
  echo "Failed to execute ingestion script file. Exiting with error..."
  exit 1
fi