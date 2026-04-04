# ── Stage 1: Install dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json turbo.json ./

# Copy workspace package.json files
COPY apps/student/package.json ./apps/student/
COPY packages/shared/package.json ./packages/shared/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/config/package.json ./packages/config/

# Install all dependencies
RUN npm ci --include=dev

# ── Stage 2: Build ──
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time env
ARG NEXT_PUBLIC_API_URL=https://intemso.com/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build shared packages, then the student app
RUN npx turbo run build --filter=@intemso/student

# ── Stage 3: Production image ──
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder /app/apps/student/public ./apps/student/public
COPY --from=builder /app/apps/student/.next/standalone ./
COPY --from=builder /app/apps/student/.next/static ./apps/student/.next/static

# Create cache dir with correct permissions
RUN mkdir -p /app/apps/student/.next/cache && chown -R nextjs:nodejs /app/apps/student/.next/cache

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/student/server.js"]
