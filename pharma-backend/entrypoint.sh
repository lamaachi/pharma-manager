#!/bin/sh

echo "Waiting for database..."
until python manage.py migrate 2>&1; do
  echo "Database not ready, retrying in 2s..."
  sleep 2
done

echo "Running seed data..."
python manage.py seed

echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000


