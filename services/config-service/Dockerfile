FROM node:18-alpine

# Crear un grupo y un usuario no privilegiado para mejorar la seguridad del contenedor
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Cambiamos el propietario de todos los archivos a nuestro usuario no privilegiado
RUN chown -R nodejs:nodejs /app

# Establecemos que el contenedor debe ejecutarse con el usuario no privilegiado 'nodejs'
USER nodejs

EXPOSE 3000

CMD ["node", "src/index.js"]
