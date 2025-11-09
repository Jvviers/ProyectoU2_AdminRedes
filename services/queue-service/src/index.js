require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/database');
const queueRoutes = require('./routes/queue.routes');
const promClient = require('prom-client');

// Inicializar prom-client
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Crear un contador customizado para los tickets generados
const ticketsGeneratedCounter = new promClient.Counter({
  name: 'queue_service_tickets_generated_total',
  help: 'Total number of tickets generated',
  labelNames: ['service_id'],
  registers: [register],
});

const app = express();
app.use(express.json());

const API_PORT = process.env.API_PORT || 3004;

// Rutas de la API, pasando el contador
app.use('/api/queue', queueRoutes(ticketsGeneratedCounter));

// Endpoint de Métricas para Prometheus
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

app.get('/', (req, res) => {
  res.send('Queue Service OK');
});

async function startServer() {
  try {
    await connectDB();
    app.listen(API_PORT, () => {
      console.log(`🚀 Queue Service corriendo en puerto ${API_PORT}`);
      console.log(`📊 Métricas disponibles en http://localhost:${API_PORT}/metrics`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
