FROM node:18-alpine

# Add package dependencies
RUN apk add --no-cache python3 make g++

# Create and set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json safely
# (use relative path from the repo root to ensure Docker finds it)
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy the rest of the backend code
COPY backend ./

# Build TypeScript code
RUN npm run build

# Set and expose the port (Render overrides PORT)
ENV PORT=3001
EXPOSE 3001

CMD ["npm", "run", "start:prod"]
