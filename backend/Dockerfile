# Use Node.js 18 on Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install dependencies (with peer deps fix)
RUN npm install --legacy-peer-deps

# Copy backend source code
COPY . .

# Build TypeScript project
RUN npm run build

# Expose backend port (Railway uses $PORT automatically)
EXPOSE 3000

# Start the compiled server
CMD ["npm", "start"]
