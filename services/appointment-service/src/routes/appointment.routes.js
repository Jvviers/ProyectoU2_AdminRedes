const express = require('express'); // Importamos Express para manejar las rutas
const router = express.Router(); // Creamos un enrutador para las rutas específicas de citas
const { body } = require('express-validator'); // Importamos la función body de express-validator para validaciones de los datos
const appointmentController = require('../controllers/appointment.controller'); // Importamos el controlador de citas
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware'); // Importamos los middlewares de autenticación y control de roles

// Validación para la creación de una cita
const createAppointmentValidation = [
  body('fecha_hora').isISO8601().withMessage('Fecha y hora inválida'), // Validamos que 'fecha_hora' sea un formato ISO8601
  body('servicio_id').isUUID().withMessage('ID de servicio inválido'), // Validamos que 'servicio_id' sea un UUID válido
  body('tipo').isIn(['presencial', 'online']).withMessage('Tipo de cita inválido'), // Validamos que 'tipo' sea 'presencial' o 'online'
  body('notas').optional().isString() // Validamos que 'notas' sea una cadena de texto, si es proporcionada
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

// Exportamos el enrutador para poder usarlo en otros archivos
module.exports = router;
