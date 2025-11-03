require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { connectDB } = require('./config/database');
const configRoutes = require('./routes/config.routes');

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'config-service' });
});

// Rutas principales
app.use('/api/config', configRoutes);

// Iniciar servidor
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Config Service corriendo en puerto ${PORT}`));
  } catch (err) {
    console.error('❌ Error al iniciar servidor:', err);
    process.exit(1);
  }
}

startServer();