require('dotenv').config(); // Cargamos las variables de entorno desde el archivo .env
const express = require('express'); // Importamos Express para crear el servidor web
const cors = require('cors'); // Importamos CORS para habilitar la comunicación entre diferentes dominios
const helmet = require('helmet'); // Importamos Helmet para agregar cabeceras de seguridad
const appointmentRoutes = require('./routes/appointment.routes'); // Importamos las rutas de citas
const { connectDB } = require('./config/database'); // Importamos la función de conexión a la base de datos

const app = express(); // Creamos una instancia de la aplicación Express
const PORT = process.env.API_PORT || 3001; // Usamos el puerto de la variable de entorno, o el 3001 por defecto

// Middlewares de seguridad
app.use(helmet()); // Añadimos las cabeceras de seguridad a todas las respuestas
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'], // Definimos los orígenes permitidos para las peticiones CORS
  credentials: true // Permitimos enviar credenciales como cookies
}));
app.use(express.json()); // Middleware para parsear el cuerpo de las peticiones como JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear datos URL-encoded (por ejemplo, formularios)


// Middleware para loguear cada petición
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`); // Imprimimos el método y la ruta de la petición con la fecha y hora
  next(); // Pasamos al siguiente middleware
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok', // Indicamos que el servicio está funcionando
    service: 'appointment-service', // Nombre del servicio
    timestamp: new Date().toISOString() // Fecha y hora actual
  });
});

// Rutas para la API de citas
app.use('/api/appointments', appointmentRoutes); // Usamos el archivo de rutas para manejar las peticiones de citas

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err); // Imprimimos el error en la consola
  res.status(err.status || 500).json({ // Respondemos con el código de estado correspondiente
    error: {
      message: err.message || 'Error interno del servidor', // Mensaje de error
      status: err.status || 500 // Código de estado del error
    }
  });
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' }); // Si la ruta no existe, devolvemos un 404
});

// Función para iniciar el servidor
async function startServer() {
  try {
    await connectDB(); // Intentamos conectar a la base de datos

    app.listen(PORT, () => { // Iniciamos el servidor en el puerto definido
      console.log(`🚀 Appointment Service corriendo en puerto ${PORT}`); // Mensaje de éxito al iniciar el servidor
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error); // Si hay error al conectar a la base de datos, lo mostramos
    process.exit(1); // Terminamos el proceso con un error
  }
}

startServer(); // Llamamos a la función para iniciar el servidor

// Manejamos la señal SIGTERM (cuando se termina el proceso)
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...'); // Mensaje cuando el proceso se cierra
  process.exit(0); // Terminamos el proceso con éxito
});
