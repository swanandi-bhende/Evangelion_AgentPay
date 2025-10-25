# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy the rest of the code
COPY . .

# Build TypeScript project
RUN npm run build

# Expose the port (Railway sets PORT)
EXPOSE 3001

# Set default PORT environment variable
ENV PORT=3001

# Start the app using compiled JS
CMD ["node", "dist/src/index.js"]
