FROM node:18-alpine

RUN mkdir -p /usr/src/viral

WORKDIR /usr/src/viral

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV PORT=80
EXPOSE 80

CMD ["node", "dist/index.js"]


# FROM node:18-alpine

# WORKDIR /hnmtest

# # Copy package files first
# COPY package*.json ./

# # Install deps (need dev deps for TS build)
# RUN npm install

# # Copy source
# COPY . .

# # Build TypeScript (CREATES dist/)
# RUN npm run build

# # Remove dev deps (optional but good)
# RUN npm prune --omit=dev

# # App runs on 3000
# EXPOSE 3000

# CMD ["node", "dist/index.js"]
