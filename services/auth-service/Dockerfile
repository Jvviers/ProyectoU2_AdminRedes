FROM node:18-alpine

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Cambiar ownership
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no privilegiado
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check / ESTO LO ENTREGÓ LA IA PERO LOS HEATHCHECKS DEBERÍAN IR EN EL DOCKER-COMPOSE, NO EN EL DOCKERFILE
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "src/index.js"]