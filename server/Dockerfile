# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:unix

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm install --omit=dev --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY .env.example ./.env

EXPOSE 3001

# Use dumb-init to handle signals properly
RUN apt-get update && apt-get install -y curl dumb-init && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Health check using node fetch
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --eval "fetch('http://localhost:' + (process.env.PORT || 3001) + '/health').then(r => process.exit(r.ok ? 0 : 1))"

# Start the server
CMD ["node", "dist/index.js"]
