const { validationResult } = require('express-validator');
const Appointment = require('../models/appointment.model');

class AppointmentController {
  constructor(appointmentsCreatedCounter) {
    this.appointmentsCreatedCounter = appointmentsCreatedCounter;
    this.createAppointment = this.createAppointment.bind(this);
    this.getMyAppointments = this.getMyAppointments.bind(this);
    this.getAllAppointments = this.getAllAppointments.bind(this);
    this.getAppointmentById = this.getAppointmentById.bind(this);
    this.cancelAppointment = this.cancelAppointment.bind(this);
    this.getAvailableTimes = this.getAvailableTimes.bind(this);
    this.bookAppointment = this.bookAppointment.bind(this);
    this.getServices = this.getServices.bind(this);
  }

  async getServices(req, res) {
    try {
      const services = await Appointment.findAllServices();
      res.json(services);
    } catch (error) {
      console.error('Error obteniendo servicios:', error);
      res.status(500).json({ error: 'Error al obtener los servicios' });
    }
  }

  async getAvailableTimes(req, res) {
    try {
      const { date, procedureId } = req.query;
      console.log(`Buscando horarios para el trámite ${procedureId} en la fecha ${date}`);

      // TODO: Lógica real para consultar la base de datos y devolver horarios disponibles.
      // Por ahora, se devuelve una lista fija para desarrollo.
      const availableTimes = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30"
      ];

      res.json(availableTimes);
    } catch (error) {
      console.error('Error obteniendo horarios disponibles:', error);
      res.status(500).json({ error: 'Error al obtener los horarios disponibles' });
    }
  }

  async bookAppointment(req, res) {
    try {
        const { rut, nombre, apellido, procedureId, date, time, userId } = req.body;

        // Combine date and time into a single ISO 8601 string
        const fecha_hora = new Date(`${date}T${time}`).toISOString();

        const appointmentData = {
          usuario_id: userId,
          servicio_id: procedureId,
          fecha_hora: fecha_hora,
          tipo: 'presencial', // Default value
          notas: `Cita para ${nombre} ${apellido} (RUT: ${rut})` // Store user info in notes
        };

        const newAppointment = await Appointment.create(appointmentData);
        
        this.appointmentsCreatedCounter.inc();

        res.status(201).json(newAppointment);
    } catch (error) {
        console.error('Error al agendar la cita:', error);
        res.status(500).json({ error: 'Error interno al procesar la solicitud de agendamiento.' });
    }
  }

  async createAppointment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const usuario_id = req.user.id;
      const { servicio_id, fecha_hora, tipo, notas } = req.body;

      // Check for overlapping appointments
      const overlap = await Appointment.hasOverlap(servicio_id, fecha_hora);
      if (overlap) {
        return res.status(409).json({ error: 'Ya existe un agendamiento que se solapa con la fecha y hora solicitada para este servicio.' });
      }

      const newAppointment = await Appointment.create({
        usuario_id,
        servicio_id,
        fecha_hora,
        tipo,
        notas
      });

      this.appointmentsCreatedCounter.inc(); // Increment the counter

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

module.exports = (appointmentsCreatedCounter) => new AppointmentController(appointmentsCreatedCounter);
