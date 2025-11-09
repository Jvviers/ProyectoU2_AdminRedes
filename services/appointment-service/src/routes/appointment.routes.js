module.exports = (appointmentsCreatedCounter) => {
  const express = require('express');
  const router = express.Router();
  const { body } = require('express-validator');
  const appointmentController = require('../controllers/appointment.controller')(appointmentsCreatedCounter);
  const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

  // Validación para la creación de una cita
  const createAppointmentValidation = [
    body('fecha_hora').isISO8601().withMessage('Fecha y hora inválida'),
    body('servicio_id').isUUID().withMessage('ID de servicio inválido'),
    body('tipo').isIn(['presencial', 'online']).withMessage('Tipo de cita inválido'),
    body('notas').optional().isString()
  ];

  // Todas las rutas están protegidas por el middleware de autenticación
  router.use(authMiddleware);

  // Obtener las citas del usuario autenticado
  router.get('/my-appointments', appointmentController.getMyAppointments);

  // Crear una nueva cita, con validaciones previas
  router.post('/', createAppointmentValidation, appointmentController.createAppointment);

  // Obtener una cita específica por su ID
  router.get('/:id', appointmentController.getAppointmentById);

  // Cancelar una cita específica por su ID
  router.delete('/:id', appointmentController.cancelAppointment);

  // Ruta solo para administradores que obtiene todas las citas
  router.get('/', roleMiddleware(['administrador']), appointmentController.getAllAppointments);

  return router;
};
