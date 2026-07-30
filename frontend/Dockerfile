# ============================================================
# Frontend Dockerfile — Star Light Path (Next.js 16)
# Multi-stage build for production-ready image
# ============================================================

# ─── Stage 1: Dependencies ───────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependency manifests only (for layer caching)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci --frozen-lockfile

# ─── Stage 2: Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build arguments (NEXT_PUBLIC_* vars must be set at build time)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build

# ─── Stage 3: Runtime ────────────────────────────────────────
FROM node:20-alpine AS runtime

LABEL maintainer="Star Light Path DevOps"
LABEL description="Next.js Frontend for Star Light Path"

# Add non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy only what's needed to run the app
COPY --from=builder /app/public ./public

# Copy standalone build output (requires output: 'standalone' in next.config.mjs)
# If standalone is not enabled, copy the full build instead:
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -q -O /dev/null http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
