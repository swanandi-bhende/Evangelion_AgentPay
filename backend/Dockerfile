FROM node:18-alpine

RUN apk add --no-cache python3 make g++


WORKDIR /usr/src/app

# Copy package files from the current build context (backend) into the image
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Copy the rest of the backend source files
COPY . ./

RUN npm run build

ENV PORT=3001
EXPOSE 3001

CMD ["npm", "run", "start:prod"]
