FROM node:18-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY backend/package*.json ./

RUN npm install --legacy-peer-deps

COPY backend/. ./

RUN npm run build

ENV PORT=3001
EXPOSE 3001

CMD ["npm", "run", "start:prod"]
