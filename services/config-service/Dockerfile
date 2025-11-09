FROM node:18-alpine

# Metadatos de la imagen
LABEL org.opencontainers.image.authors="Gemini"
LABEL org.opencontainers.image.vendor="ProyectoU2_AdminRedes"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.title="config-service"
LABEL org.opencontainers.image.description="Servicio para gestionar la configuración."

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
