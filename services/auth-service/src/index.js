require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const promClient = require('prom-client');

// Inicializar prom-client
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Crear contadores customizados para logins
const loginSuccessCounter = new promClient.Counter({
  name: 'auth_service_login_success_total',
  help: 'Total number of successful login attempts',
  registers: [register],
});

const loginFailedCounter = new promClient.Counter({
  name: 'auth_service_login_failed_total',
  help: 'Total number of failed login attempts',
  registers: [register],
});

// Ahora que los contadores existen, podemos inicializar las rutas
const authRoutes = require('./routes/auth.routes')(loginSuccessCounter, loginFailedCounter);

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check // VERIFICAR SI ESTO SIGUE FUNCIONANDO A LA HORA DE CAMBIAR LOS HEALTHCHECKS AL DOCKER-COMPOSE
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Rutas
app.use('/api/auth', authRoutes);

// Endpoint de Métricas para Prometheus
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error interno del servidor',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
async function startServer() {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`🚀 Auth Service corriendo en puerto ${PORT}`);
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