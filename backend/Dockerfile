# Use official Node 18 Alpine base image
FROM node:18-alpine

# Install required build tools
RUN apk add --no-cache python3 make g++

# Create working directory inside container
WORKDIR /usr/src/app

# Copy package.json + package-lock.json from backend folder (Render builds from repo root)
COPY backend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the backend source code
COPY backend ./

# Build TypeScript
RUN npm run build

# Expose and run
ENV PORT=3001
EXPOSE 3001

CMD ["npm", "run", "start:prod"]
