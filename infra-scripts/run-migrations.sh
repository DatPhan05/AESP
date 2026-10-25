#!/usr/bin/env bash
set -e

DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"1234"}
DB_NAME=${DB_NAME:-"aesp"}

echo "🚀 Running database schema initialization & migrations on ${DB_HOST}:${DB_PORT}/${DB_NAME}..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Check if psql is available
if command -v psql &> /dev/null; then
  export PGPASSWORD="${DB_PASSWORD}"
  if [ -f "${ROOT_DIR}/backend/db/schema.sql" ]; then
    echo "📄 Applying schema.sql..."
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${ROOT_DIR}/backend/db/schema.sql"
    echo "✅ schema.sql applied successfully!"
  fi

  # Apply migration files if any exist
  if [ -d "${ROOT_DIR}/backend/db/migrations" ]; then
    for migration in "${ROOT_DIR}/backend/db/migrations"/*.sql; do
      if [ -f "$migration" ]; then
        echo "📄 Applying migration: $(basename "$migration")..."
        psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "$migration"
      fi
    done
  fi
else
  echo "⚠️  psql command not found, falling back to node migration runner..."
  node "${ROOT_DIR}/backend/db/init-db.js"
fi

echo "🎉 Database migrations completed!"
