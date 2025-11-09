# Usar una imagen base de Node.js
FROM node:18-alpine

# Crear un grupo y un usuario no privilegiado para mejorar la seguridad del contenedor
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Cambiamos el propietario de todos los archivos a nuestro usuario no privilegiado
RUN chown -R nodejs:nodejs /app

# Establecemos que el contenedor debe ejecutarse con el usuario no privilegiado 'nodejs'
USER nodejs

# Exponer el puerto en el que correrá la aplicación
EXPOSE 3005

# Comando para iniciar la aplicación
CMD [ "npm", "start" ]
