# Usamos la imagen oficial de Node.js 18 basada en Alpine (más ligera)
FROM node:18-alpine

# Metadatos de la imagen
LABEL org.opencontainers.image.authors="Gemini"
LABEL org.opencontainers.image.vendor="ProyectoU2_AdminRedes"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.title="appointment-service"
LABEL org.opencontainers.image.description="Servicio para gestionar citas."

# Crear un grupo y un usuario no privilegiado para mejorar la seguridad del contenedor
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias (package.json y package-lock.json) al contenedor
COPY package*.json ./

# Instalamos las dependencias de producción con npm ci (instalación limpia y eficiente)
RUN npm ci --only=production

# Copiamos todo el código fuente del proyecto al contenedor
COPY . .

# Cambiamos el propietario de todos los archivos a nuestro usuario no privilegiado
RUN chown -R nodejs:nodejs /app

# Establecemos que el contenedor debe ejecutarse con el usuario no privilegiado 'nodejs'
USER nodejs

# Exponemos el puerto 3000 para que el contenedor sea accesible desde el exterior
EXPOSE 3000

# Definimos el comando para iniciar la aplicación, en este caso 'node src/index.js'
CMD ["node", "src/index.js"]
