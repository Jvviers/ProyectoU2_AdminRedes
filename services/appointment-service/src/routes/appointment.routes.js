const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const appointmentController = require('../controllers/appointment.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

// Validation for creating an appointment
const createAppointmentValidation = [
  body('fecha_cita').isISO8601().toDate().withMessage('Fecha de cita inválida'),
  body('hora_cita').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de cita inválida'),
  body('tramite_id').isInt().withMessage('ID de trámite inválido'),
  body('direccion_id').isInt().withMessage('ID de dirección inválido')
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