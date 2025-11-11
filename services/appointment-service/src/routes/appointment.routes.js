module.exports = (appointmentsCreatedCounter) => {
  const express = require('express');
  const router = express.Router();
  const { body } = require('express-validator');
  const appointmentController = require('../controllers/appointment.controller')(appointmentsCreatedCounter);
  const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

  router.use(authMiddleware);

  // Obtener todos los servicios disponibles
  router.get('/services', appointmentController.getServices);

  // Obtener los horarios disponibles para una fecha y trámite
  router.get('/available-times', appointmentController.getAvailableTimes);

  // Agendar una nueva cita
  router.post('/book', appointmentController.bookAppointment);

  // Obtener las citas del usuario autenticado
  router.get('/my-appointments', appointmentController.getMyAppointments);

  // Obtener una cita específica por su ID
  router.get('/:id', appointmentController.getAppointmentById);

  // Cancelar una cita específica por su ID
  router.delete('/:id', appointmentController.cancelAppointment);

  // Ruta solo para administradores que obtiene todas las citas
  router.get('/', roleMiddleware(['administrador']), appointmentController.getAllAppointments);

  return router;
};
