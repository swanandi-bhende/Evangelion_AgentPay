FROM node:18-alpine

WORKDIR /usr/src/app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

ENV PORT=3001
EXPOSE 3001

CMD ["node", "dist/server.js"]
