require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/database');
const promClient = require('prom-client');

// Inicializar prom-client
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Crear contador customizado
const appointmentsCreatedCounter = new promClient.Counter({
  name: 'appointment_service_appointments_created_total',
  help: 'Total number of appointments created',
  registers: [register],
});

// Inicializar rutas con el contador
const appointmentRoutes = require('./routes/appointment.routes')(appointmentsCreatedCounter);

const app = express();
const PORT = process.env.API_PORT || 3003;

// Middlewares de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para loguear cada petición
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'appointment-service',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de Métricas para Prometheus
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

// Rutas para la API de citas
app.use('/api/appointments', appointmentRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error interno del servidor',
      status: err.status || 500
    }
  });
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Appointment Service corriendo en puerto ${PORT}`);
      console.log(`📊 Métricas disponibles en http://localhost:${PORT}/metrics`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});
