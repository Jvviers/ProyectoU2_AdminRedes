const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Ruta para interactuar con el chatbot
router.post('/chat', aiController.chat);

module.exports = router;
