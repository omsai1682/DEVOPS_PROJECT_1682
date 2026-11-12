# Multi-stage production build for Node.js Express backend
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies needed for native builds if any
RUN apk add --no-cache curl

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/

# Expose backend service port
EXPOSE 5000

# Set environment defaults
ENV PORT=5000 \
    NODE_ENV=production

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start production server
CMD ["node", "src/server.js"]
