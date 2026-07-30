#!/bin/sh
# ==============================================================
# docker-entrypoint.sh — Star Light Path Backend Entrypoint
# ==============================================================
# Responsibilities:
#   1. Wait for the database to be ready
#   2. Apply Django migrations
#   3. Collect static files
#   4. Optionally create a superuser
#   5. Start the application server (gunicorn)
# ==============================================================

set -e

echo "──────────────────────────────────────────"
echo "  Star Light Path — Backend Starting Up"
echo "──────────────────────────────────────────"

# ─── Wait for Database ───────────────────────────────────────
echo "[entrypoint] Waiting for database..."

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_ENGINE="${DB_ENGINE:-django.db.backends.sqlite3}"

if [ "$DB_ENGINE" != "django.db.backends.sqlite3" ]; then
    max_retries=30
    retry_count=0
    until python -c "
import sys, os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'starlightpath.settings')
django.setup()
from django.db import connections
try:
    connections['default'].ensure_connection()
    print('Database is ready.')
    sys.exit(0)
except Exception as e:
    print(f'Database not ready: {e}')
    sys.exit(1)
" 2>/dev/null; do
        retry_count=$((retry_count + 1))
        if [ "$retry_count" -ge "$max_retries" ]; then
            echo "[entrypoint] ERROR: Database did not become ready after ${max_retries} attempts. Exiting."
            exit 1
        fi
        echo "[entrypoint] Database not ready — retrying in 2s... (attempt ${retry_count}/${max_retries})"
        sleep 2
    done
else
    echo "[entrypoint] Using SQLite — skipping database readiness check."
fi

# ─── Run Migrations ──────────────────────────────────────────
echo "[entrypoint] Applying database migrations..."
python manage.py migrate --noinput

# ─── Collect Static Files ────────────────────────────────────
echo "[entrypoint] Collecting static files..."
python manage.py collectstatic --noinput --clear

# ─── Optional: Create Superuser ──────────────────────────────
# Set DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_PASSWORD, DJANGO_SUPERUSER_FULLNAME
# in your environment to auto-create a superuser on first boot.
if [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "[entrypoint] Creating superuser if not exists..."
    python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
email = '${DJANGO_SUPERUSER_EMAIL}'
password = '${DJANGO_SUPERUSER_PASSWORD}'
full_name = '${DJANGO_SUPERUSER_FULLNAME:-Super Admin}'
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, full_name=full_name, password=password)
    print(f'Superuser created: {email}')
else:
    print(f'Superuser already exists: {email}')
" || echo "[entrypoint] WARNING: Superuser creation failed (non-fatal)."
fi

echo "[entrypoint] Startup complete. Launching server..."
echo "──────────────────────────────────────────"

# ─── Start Server ────────────────────────────────────────────
exec "$@"
