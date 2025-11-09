require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const aiRoutes = require('./routes/ai.routes');
const promClient = require('prom-client');

// Inicializar prom-client
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Crear contador customizado
const chatRequestsCounter = new promClient.Counter({
  name: 'ai_service_chat_requests_total',
  help: 'Total number of chat requests received',
  registers: [register],
});

// Pasar el contador al controlador (si es necesario, o usarlo directamente en las rutas)
// Por simplicidad, lo dejaremos aquí y el controlador podría importarlo si se modulariza más.

const app = express();
const PORT = process.env.API_PORT || 3007;

// Middlewares de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para loguear cada petición
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  // Incrementar el contador en cada request a la API de chat
  if (req.path.startsWith('/api/ai/chat')) {
    chatRequestsCounter.inc();
  }
  next();
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ai-service',
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

// Rutas para la API de IA
app.use('/api/ai', aiRoutes);

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
function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 AI Service corriendo en puerto ${PORT}`);
    console.log(`📊 Métricas disponibles en http://localhost:${PORT}/metrics`);
  });
}

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});
