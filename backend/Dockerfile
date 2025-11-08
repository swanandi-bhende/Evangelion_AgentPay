FROM node:18-alpine

# Add package dependencies
RUN apk add --no-cache python3 make g++

# Create and set working directory
WORKDIR /usr/src/app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port (Render overrides PORT automatically)
ENV PORT=3001
EXPOSE 3001

# Start production server
CMD ["npm", "run", "start:prod"]
