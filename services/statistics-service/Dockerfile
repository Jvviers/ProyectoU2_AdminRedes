# Usar una imagen base de Node.js
FROM node:18-alpine

# Metadatos de la imagen
LABEL org.opencontainers.image.authors="Gemini"
LABEL org.opencontainers.image.vendor="ProyectoU2_AdminRedes"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.title="statistics-service"
LABEL org.opencontainers.image.description="Servicio para gestionar estadísticas."

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto en el que correrá la aplicación
EXPOSE 3006

# Comando para iniciar la aplicación
CMD [ "npm", "start" ]
