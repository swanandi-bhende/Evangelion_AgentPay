# Use official Node.js LTS image
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install only production dependencies and cache node_modules
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Build your app if needed (uncomment if you have a build step)
# RUN npm run build

# Expose port (Railway sets the PORT environment variable automatically)
EXPOSE 3000

# Use environment variable PORT if available, fallback to 3000
ENV PORT=3000

# Start the app
CMD ["node", "index.js"]
