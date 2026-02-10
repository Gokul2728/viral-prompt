# FROM node:16.20-bullseye-slim

# RUN mkdir -p  /usr/src/hnmapi
# ADD ./package.json package-lock.json /hnmapi/
# WORKDIR /hnmapi
# RUN npm install
# ADD . /hnmapi/
# ENV PORT=80
# EXPOSE 80
# CMD ["npm","start"]

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (include dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to keep image lean
RUN npm prune --omit=dev

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]