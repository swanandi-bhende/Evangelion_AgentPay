# Use official Node.js 20 LTS image
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose a port for reference (Railway will override with its own PORT)
EXPOSE 3000

# Start the app using the PORT environment variable provided by Railway
CMD ["node", "index.js"]
