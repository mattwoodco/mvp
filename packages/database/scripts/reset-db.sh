#!/bin/bash

env_file=${1:-local}
if [[ "$env_file" == "prod" || "$env_file" == "production" ]]; then
  read -p "Are you sure you want to nuke the PRODUCTION database? Type YES to continue: " confirm
  if [[ "$confirm" != "YES" ]]; then
    echo "Aborted."
    exit 1
  fi
fi

echo "💥 Resetting database..."

# Drop and recreate the schema
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "✅ Database reset complete!" 
