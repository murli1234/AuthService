# --------------------
# 🏗️ Builder Stage
# --------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy the rest of the source code
COPY . .

# ----------------------------
# 🪶 Runtime Stage (Alpine Minimal)
# ----------------------------
FROM node:20-alpine

WORKDIR /app

# Copy the built app and installed production dependencies
COPY --from=builder /app .

# Expose app port
EXPOSE 3000

# Start the Node.js service
CMD ["node", "src/index.js"]
