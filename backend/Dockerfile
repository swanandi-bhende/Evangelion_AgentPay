# Use Node.js 18 on Alpine for a smaller image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files first for caching
COPY package*.json ./

# Install dependencies (with peer deps fix for older packages)
RUN npm install --legacy-peer-deps

# Copy the rest of your source code
COPY . .

# Build TypeScript project
RUN npm run build

# ----------------------------
# Use a smaller runtime image
# ----------------------------
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy only built files and node_modules from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules

# Expose backend port (Railway uses $PORT automatically)
EXPOSE 3000

# Start the compiled server
CMD ["npm", "start"]
