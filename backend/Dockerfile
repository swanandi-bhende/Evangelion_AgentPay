FROM node:18-alpine

# Add package dependencies
RUN apk add --no-cache python3 make g++

# Create and set working directory
WORKDIR /usr/src/app

# Copy package.json (must exist)
COPY package.json ./

# Try to copy package-lock if it exists
COPY package-lock.json ./

# Install dependencies with legacy peer deps flag
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build TypeScript code
RUN npm run build

# Set and expose the port (Railway will override PORT env var)
ENV PORT=3001
EXPOSE 3001

# Start production server
CMD ["npm", "run", "start:prod"]
