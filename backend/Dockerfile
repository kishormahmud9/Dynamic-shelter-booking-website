# ============================================================
# Backend Dockerfile — Star Light Path (Django)
# Multi-stage build for production-ready image
# ============================================================

# ─── Stage 1: Builder ────────────────────────────────────────
FROM python:3.12-slim AS builder

# Build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Install Python dependencies into a venv for clean isolation
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --prefix=/install --no-cache-dir -r requirements.txt \
    # Install gunicorn and psycopg2 (not in requirements.txt but required for production)
    && pip install --prefix=/install --no-cache-dir \
        gunicorn==23.0.0 \
        psycopg2-binary==2.9.10

# ─── Stage 2: Runtime ────────────────────────────────────────
FROM python:3.12-slim AS runtime

LABEL maintainer="Star Light Path DevOps"
LABEL description="Django REST API for Star Light Path"

# Runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Create non-root user for security
RUN groupadd --gid 1001 appgroup \
    && useradd --uid 1001 --gid appgroup --shell /bin/bash --create-home appuser

# Set working directory
WORKDIR /app

# Copy application code
COPY --chown=appuser:appgroup . .

# Create required directories with correct ownership
RUN mkdir -p /app/staticfiles /app/media \
    && chown -R appuser:appgroup /app/staticfiles /app/media

# Copy and set up entrypoint
COPY --chown=appuser:appgroup docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Switch to non-root user
USER appuser

# Expose gunicorn port
EXPOSE 8000

# Health check — polls Django's /api/auth/token/verify/ (or a dedicated /health/ endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/schema/ || exit 1

# Entrypoint handles migrations, collectstatic, then starts gunicorn
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["gunicorn", "starlightpath.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--worker-class", "sync", \
     "--worker-tmp-dir", "/dev/shm", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--log-level", "info"]
