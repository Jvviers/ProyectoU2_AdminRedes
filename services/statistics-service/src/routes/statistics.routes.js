module.exports = (statisticsRetrievedCounter) => {
  const express = require('express');
  const router = express.Router();
  const statisticsController = require('../controllers/statistics.controller')(statisticsRetrievedCounter);

  // Obtener un resumen general de estadísticas
  router.get('/summary', statisticsController.getSummary);

  // Obtener estadísticas por servicio
  router.get('/service/:serviceId', statisticsController.getServiceStatistics);

  // Obtener estadísticas diarias
  router.get('/daily', statisticsController.getDailyStatistics);

  return router;
};
