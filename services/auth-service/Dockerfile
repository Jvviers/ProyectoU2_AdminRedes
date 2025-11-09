FROM node:18-alpine

# Metadatos de la imagen
LABEL org.opencontainers.image.authors="Gemini"
LABEL org.opencontainers.image.vendor="ProyectoU2_AdminRedes"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.title="auth-service"
LABEL org.opencontainers.image.description="Servicio de autenticación de usuarios."

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

# Comando de inicio
CMD ["node", "src/index.js"]