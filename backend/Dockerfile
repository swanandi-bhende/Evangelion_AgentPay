FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files first (helps with layer caching)
COPY package*.json ./

# Install dependencies with legacy peer deps flag
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port (Railway will override with $PORT)
EXPOSE 3001

# Start production server
CMD ["npm", "run", "start:prod"]
