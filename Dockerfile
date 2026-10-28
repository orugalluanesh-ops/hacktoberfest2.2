# Production Dockerfile for ResQHarvest Zero-Waste Intelligence Engine
FROM node:22-alpine

WORKDIR /app

# Copy dependency definition
COPY package.json ./

# Copy application files
COPY server.js ./
COPY public ./public

# Environment configuration
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
