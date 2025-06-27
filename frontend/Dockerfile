# Railway-optimized Dockerfile for React app
FROM node:20.19.3-slim AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM caddy:2-alpine

# Set working directory
WORKDIR /app

# Copy built files
COPY --from=build /app/dist ./dist

# Copy Caddyfile
COPY Caddyfile.simple ./Caddyfile

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start Caddy
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"] 