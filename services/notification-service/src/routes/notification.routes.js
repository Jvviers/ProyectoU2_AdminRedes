module.exports = (notificationsSentCounter) => {
  const express = require('express');
  const router = express.Router();
  const notificationController = require('../controllers/notification.controller')(notificationsSentCounter);

  // Enviar una notificación
  router.post('/send', notificationController.sendNotification);

  // Obtener el estado de una notificación
  router.get('/:id', notificationController.getNotificationStatus);

  return router;
};
