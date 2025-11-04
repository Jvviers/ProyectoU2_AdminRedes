const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const appointmentController = require('../controllers/appointment.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

// Validation for creating an appointment
const createAppointmentValidation = [
  body('fecha_hora').isISO8601().withMessage('Fecha y hora inválida'),
  body('servicio_id').isUUID().withMessage('ID de servicio inválido'),
  body('tipo').isIn(['presencial', 'online']).withMessage('Tipo de cita inválido'),
  body('notas').optional().isString()
];

// All routes are protected
router.use(authMiddleware);

// Get user's own appointments
router.get('/my-appointments', appointmentController.getMyAppointments);

// Create a new appointment
router.post('/', createAppointmentValidation, appointmentController.createAppointment);

// Get a specific appointment
router.get('/:id', appointmentController.getAppointmentById);

// Cancel an appointment
router.delete('/:id', appointmentController.cancelAppointment);

// Admin route to get all appointments
router.get('/', roleMiddleware(['administrador']), appointmentController.getAllAppointments);


module.exports = router;