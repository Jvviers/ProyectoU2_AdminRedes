const { validationResult } = require('express-validator');
const Appointment = require('../models/appointment.model');

class AppointmentController {
  // Función para crear una nueva cita
  async createAppointment(req, res) {
    try {
      // Validamos los posibles errores en los datos recibidos
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Si hay errores, respondemos con un 400 y los errores
      }

      // El id del usuario debería venir de un middleware de autenticación
      const usuario_id = req.user.id; 
      const { fecha_cita, hora_cita, tramite_id, direccion_id } = req.body;

      // Creamos la nueva cita en la base de datos
      const newAppointment = await Appointment.create({
        fecha_cita,
        hora_cita,
        usuario_id,
        tramite_id,
        direccion_id
      });

      // Respondemos con un mensaje de éxito y los detalles de la cita creada
      res.status(201).json({
        message: 'Cita creada exitosamente',
        appointment: newAppointment
      });
    } catch (error) {
      console.error('Error creando cita:', error); // Si ocurre un error, lo mostramos en consola
      res.status(500).json({ error: 'Error al crear la cita' }); // Respondemos con un error 500 si no se puede crear la cita
    }
  }

  // Función para obtener las citas del usuario autenticado
  async getMyAppointments(req, res) {
    try {
      const usuario_id = req.user.id; // Obtenemos el id del usuario desde el middleware de autenticación
      const appointments = await Appointment.findByUserId(usuario_id); // Buscamos las citas del usuario
      res.json(appointments); // Respondemos con las citas del usuario
    } catch (error) {
      console.error('Error obteniendo mis citas:', error); // Si ocurre un error, lo mostramos en consola
      res.status(500).json({ error: 'Error al obtener las citas' }); // Respondemos con un error 500 si no se puede obtener las citas
    }
  }

  // Función para obtener todas las citas (solo para administradores)
  async getAllAppointments(req, res) {
    // Esto debería estar restringido a administradores
    try {
      const appointments = await Appointment.findAll(); // Obtenemos todas las citas
      res.json(appointments); // Respondemos con todas las citas
    } catch (error) {
      console.error('Error obteniendo todas las citas:', error); // Si ocurre un error, lo mostramos en consola
      res.status(500).json({ error: 'Error al obtener las citas' }); // Respondemos con un error 500 si no se pueden obtener las citas
    }
  }

  // Función para obtener una cita específica por su ID
  async getAppointmentById(req, res) {
    try {
      const appointment = await Appointment.findById(req.params.id); // Buscamos la cita por ID
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' }); // Si no existe la cita, respondemos con un 404
      }
      // Comprobamos si el usuario tiene permisos para ver esta cita
      if (req.user.rol !== 'administrador' && appointment.usuario_id !== req.user.id) {
          return res.status(403).json({ error: 'No autorizado para ver esta cita' }); // Si no tiene permisos, respondemos con un 403
      }
      res.json(appointment); // Respondemos con los detalles de la cita
    } catch (error) {
      console.error('Error obteniendo cita por ID:', error); // Si ocurre un error, lo mostramos en consola
      res.status(500).json({ error: 'Error al obtener la cita' }); // Respondemos con un error 500 si no se puede obtener la cita
    }
  }

  // Función para cancelar una cita
  async cancelAppointment(req, res) {
    try {
      const appointment = await Appointment.findById(req.params.id); // Buscamos la cita por ID
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' }); // Si no existe la cita, respondemos con un 404
      }
      // Comprobamos si el usuario tiene permisos para cancelar esta cita
      if (req.user.rol !== 'administrador' && appointment.usuario_id !== req.user.id) {
          return res.status(403).json({ error: 'No autorizado para cancelar esta cita' }); // Si no tiene permisos, respondemos con un 403
      }

      // Cancelamos la cita
      const cancelledAppointment = await Appointment.delete(req.params.id);
      res.json({ message: 'Cita cancelada', appointment: cancelledAppointment }); // Respondemos con un mensaje de éxito
    } catch (error) {
      console.error('Error cancelando cita:', error); // Si ocurre un error, lo mostramos en consola
      res.status(500).json({ error: 'Error al cancelar la cita' }); // Respondemos con un error 500 si no se puede cancelar la cita
    }
  }
}

module.exports = new AppointmentController(); // Exportamos el controlador para usarlo en otras partes de la aplicación
