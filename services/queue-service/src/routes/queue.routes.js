const express = require('express');
const router = express.Router();

module.exports = (ticketsGeneratedCounter) => {
    const queueController = require('../controllers/queue.controller')(ticketsGeneratedCounter);

    // Generar un nuevo número de atención para un servicio
    router.post('/generate', queueController.generateNumber);

    // Llamar al siguiente número de un servicio
    router.get('/next/:serviceId', queueController.callNext);

    // Obtener el estado actual de la cola para un servicio
    router.get('/status/:serviceId', queueController.getStatus);

    return router;
};
