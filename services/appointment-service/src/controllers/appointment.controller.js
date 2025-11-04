const { validationResult } = require('express-validator'); // Importamos la función para validar los datos de la petición
const Appointment = require('../models/appointment.model'); // Importamos el modelo de agendamientos

class AppointmentController {
  // Método para crear un nuevo agendamiento
  async createAppointment(req, res) {
    try {
      // Validamos los posibles errores en los datos de la petición
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Si hay errores de validación, respondemos con un 400 y los errores
      }

      // Obtenemos el ID del usuario desde el middleware de autenticación
      const usuario_id = req.user.id;
      const { servicio_id, fecha_hora, tipo, notas } = req.body; // Extraemos los datos de la cita desde el cuerpo de la petición

      // Creamos un nuevo agendamiento en la base de datos
      const newAppointment = await Appointment.create({
        usuario_id,
        servicio_id,
        fecha_hora,
        tipo,
        notas
      });

      // Respondemos con un mensaje de éxito y el agendamiento creado
      res.status(201).json({
        message: 'Agendamiento creado exitosamente',
        appointment: newAppointment
      });
    } catch (error) {
      console.error('Error creando agendamiento:', error); // Si ocurre un error, lo mostramos en consola
      res.status(500).json({ error: 'Error al crear el agendamiento' }); // Respondemos con un error 500 si no se puede crear el agendamiento
    }
  }

  // Método para obtener los agendamientos del usuario autenticado
  async getMyAppointments(req, res) {
    try {
      const usuario_id = req.user.id; // Obtenemos el ID del usuario autenticado
      const appointments = await Appointment.findByUserId(usuario_id); // Buscamos los agendamientos del usuario
      res.json(appointments); // Respondemos con los agendamientos del usuario
    } catch (error) {
      console.error('Error obteniendo mis agendamientos:', error); // Si ocurre un error, lo mostramos en consola
      res.status(500).json({ error: 'Error al obtener los agendamientos' }); // Respondemos con un error 500 si no se pueden obtener los agendamientos
    }
  }

  // Método para obtener todos los agendamientos (solo para administradores)
  async getAllAppointments(req, res) {
    try {
      const appointments = await Appointment.findAll(); // Obtenemos todos los agendamientos
      res.json(appointments); // Respondemos con todos los agendamientos
    } catch (error) {
      console.error('Error obteniendo todos los agendamientos:', error); // Si ocurre un error, lo mostramos en consola
      res.status(500).json({ error: 'Error al obtener los agendamientos' }); // Respondemos con un error 500 si no se pueden obtener los agendamientos
    }
  }

  // Método para obtener un agendamiento específico por su ID
  async getAppointmentById(req, res) {
    try {
      const appointment = await Appointment.findById(req.params.id); // Buscamos el agendamiento por su ID
      if (!appointment) {
        return res.status(404).json({ error: 'Agendamiento no encontrado' }); // Si no existe el agendamiento, respondemos con un 404
      }

      // Comprobamos si el usuario tiene permisos para ver este agendamiento
      if (req.user.rol !== 'administrador' && appointment.usuario_id !== req.user.id) {
          return res.status(403).json({ error: 'No autorizado para ver este agendamiento' }); // Si no tiene permisos, respondemos con un 403
      }

      // Respondemos con los detalles del agendamiento encontrado
      res.json(appointment);
    } catch (error) {
      console.error('Error obteniendo agendamiento por ID:', error); // Si ocurre un error, lo mostramos en consola
      res.status(500).json({ error: 'Error al obtener el agendamiento' }); // Respondemos con un error 500 si no se puede obtener el agendamiento
    }
  }

  // Método para cancelar un agendamiento
  async cancelAppointment(req, res) {
    try {
      const appointment = await Appointment.findById(req.params.id); // Buscamos el agendamiento por su ID
      if (!appointment) {
        return res.status(404).json({ error: 'Agendamiento no encontrado' }); // Si no existe el agendamiento, respondemos con un 404
      }

      // Comprobamos si el usuario tiene permisos para cancelar este agendamiento
      if (req.user.rol !== 'administrador' && appointment.usuario_id !== req.user.id) {
          return res.status(403).json({ error: 'No autorizado para cancelar este agendamiento' }); // Si no tiene permisos, respondemos con un 403
      }

      // Cancelamos el agendamiento cambiando su estado a 'cancelado'
      const cancelledAppointment = await Appointment.cancel(req.params.id);
      res.json({ message: 'Agendamiento cancelado', appointment: cancelledAppointment }); // Respondemos con un mensaje de éxito
    } catch (error) {
      console.error('Error cancelando agendamiento:', error); // Si ocurre un error, lo mostramos en consola
      res.status(500).json({ error: 'Error al cancelar el agendamiento' }); // Respondemos con un error 500 si no se puede cancelar el agendamiento
    }
  }
}

module.exports = new AppointmentController(); // Exportamos la clase para que pueda ser utilizada en otras partes de la aplicación
