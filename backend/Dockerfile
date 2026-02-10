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

WORKDIR /hnmtest

# Copy package files first
COPY package*.json ./

# Install deps (need dev deps for TS build)
RUN npm install

# Copy source
COPY . .

# Build TypeScript (CREATES dist/)
RUN npm run build

# Remove dev deps (optional but good)
RUN npm prune --omit=dev

# App runs on 3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
