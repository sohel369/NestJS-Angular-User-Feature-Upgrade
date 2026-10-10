# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application & assets from builder
COPY --from=builder /app/dist ./dist

# Create upload directory with proper permissions
RUN mkdir -p /app/uploads/avatars && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/main"]
