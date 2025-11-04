const { validationResult } = require('express-validator');
const Appointment = require('../models/appointment.model');

class AppointmentController {
  async createAppointment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const usuario_id = req.user.id;
      const { servicio_id, fecha_hora, tipo, notas } = req.body;

      const newAppointment = await Appointment.create({
        usuario_id,
        servicio_id,
        fecha_hora,
        tipo,
        notas
      });

      res.status(201).json({
        message: 'Agendamiento creado exitosamente',
        appointment: newAppointment
      });
    } catch (error) {
      console.error('Error creando agendamiento:', error);
      res.status(500).json({ error: 'Error al crear el agendamiento' });
    }
  }

  async getMyAppointments(req, res) {
    try {
      const usuario_id = req.user.id;
      const appointments = await Appointment.findByUserId(usuario_id);
      res.json(appointments);
    } catch (error) {
      console.error('Error obteniendo mis agendamientos:', error);
      res.status(500).json({ error: 'Error al obtener los agendamientos' });
    }
  }

  async getAllAppointments(req, res) {
    try {
      const appointments = await Appointment.findAll();
      res.json(appointments);
    } catch (error) {
      console.error('Error obteniendo todos los agendamientos:', error);
      res.status(500).json({ error: 'Error al obtener los agendamientos' });
    }
  }

  async getAppointmentById(req, res) {
    try {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: 'Agendamiento no encontrado' });
      }
      if (req.user.rol !== 'administrador' && appointment.usuario_id !== req.user.id) {
          return res.status(403).json({ error: 'No autorizado para ver este agendamiento' });
      }
      res.json(appointment);
    } catch (error) {
      console.error('Error obteniendo agendamiento por ID:', error);
      res.status(500).json({ error: 'Error al obtener el agendamiento' });
    }
  }

  async cancelAppointment(req, res) {
    try {
      const appointment = await Appointment.findById(req.params.id);
       if (!appointment) {
        return res.status(404).json({ error: 'Agendamiento no encontrado' });
      }
      if (req.user.rol !== 'administrador' && appointment.usuario_id !== req.user.id) {
          return res.status(403).json({ error: 'No autorizado para cancelar este agendamiento' });
      }

      const cancelledAppointment = await Appointment.cancel(req.params.id);
      res.json({ message: 'Agendamiento cancelado', appointment: cancelledAppointment });
    } catch (error) {
      console.error('Error cancelando agendamiento:', error);
      res.status(500).json({ error: 'Error al cancelar el agendamiento' });
    }
  }
}

module.exports = new AppointmentController();
