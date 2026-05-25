#!/bin/sh
set -e

mkdir -p /app/data/cms/submissions /app/data/cms/rate-limits /app/public/uploads

if [ -n "$ADMIN_PASSWORD" ] && [ ! -f /app/data/cms/.admin-hash ]; then
  echo "Creating admin password hash..."
  node /app/scripts/init-admin.mjs || echo "Admin init skipped (set ADMIN_PASSWORD with min. 10 chars)."
fi

exec node /app/server.js
