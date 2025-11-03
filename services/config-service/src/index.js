const express = require('express');
const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'config-service' });
});

app.listen(PORT, () => {
  console.log(`🚀 Config Service corriendo en puerto ${PORT}`);
});
