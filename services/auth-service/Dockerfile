FROM node:18.18.2-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

FROM node:18.18.2-alpine

LABEL maintainer="Your Name <your.email@example.com>"

LABEL description="Authentication service for the project."

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/node_modules ./node_modules

COPY . .

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/index.js"]
