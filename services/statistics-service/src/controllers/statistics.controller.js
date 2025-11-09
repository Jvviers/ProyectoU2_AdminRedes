const { pool } = require('../config/database');

module.exports = (statisticsRetrievedCounter) => {
  // Obtener un resumen general de estadísticas
  const getSummary = async (req, res) => {
      try {
          // Ejemplo: Total de atenciones completadas
          const totalCompletedQueues = await pool.query(
              "SELECT COUNT(*) FROM queues WHERE status = 'finished'"
          );
          const totalCompletedAppointments = await pool.query(
              "SELECT COUNT(*) FROM agendamientos WHERE estado = 'completado'"
          );

          // Ejemplo: Número de servicios activos
          const activeServices = await pool.query(
              "SELECT COUNT(*) FROM servicios WHERE activo = TRUE"
          );

          statisticsRetrievedCounter.inc(); // Increment the counter

          res.status(200).json({
              total_queues_finished: parseInt(totalCompletedQueues.rows[0].count),
              total_appointments_completed: parseInt(totalCompletedAppointments.rows[0].count),
              active_services_count: parseInt(activeServices.rows[0].count),
              // Más estadísticas generales aquí
          });
      } catch (error) {
          console.error('Error al obtener resumen de estadísticas:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
      }
  };

  // Obtener estadísticas por servicio
  const getServiceStatistics = async (req, res) => {
      const { serviceId } = req.params;
      try {
          // Ejemplo: Atenciones completadas para un servicio específico
          const completedQueues = await pool.query(
              "SELECT COUNT(*) FROM queues WHERE service_id = $1 AND status = 'finished'",
              [serviceId]
          );
          const completedAppointments = await pool.query(
              "SELECT COUNT(*) FROM agendamientos WHERE servicio_id = $1 AND estado = 'completado'",
              [serviceId]
          );

          // Ejemplo: Tiempo de espera promedio para un servicio (desde la tabla 'estadisticas')
          const avgWaitTime = await pool.query(
              "SELECT AVG(tiempo_espera_promedio_minutos) FROM estadisticas WHERE servicio_id = $1",
              [serviceId]
          );

          statisticsRetrievedCounter.inc(); // Increment the counter

          res.status(200).json({
              service_id: serviceId,
              completed_queues: parseInt(completedQueues.rows[0].count),
              completed_appointments: parseInt(completedAppointments.rows[0].count),
              average_wait_time_minutes: parseFloat(avgWaitTime.rows[0].avg || 0).toFixed(2),
              // Más estadísticas específicas del servicio
          });
      } catch (error) {
          console.error('Error al obtener estadísticas por servicio:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
      }
  };

  // Obtener estadísticas diarias (ejemplo)
  const getDailyStatistics = async (req, res) => {
      const { date } = req.query; // Formato YYYY-MM-DD
      if (!date) {
          return res.status(400).json({ error: 'El parámetro "date" es requerido (YYYY-MM-DD).' });
      }

      try {
          const dailyStats = await pool.query(
              "SELECT * FROM estadisticas WHERE fecha = $1",
              [date]
          );
          statisticsRetrievedCounter.inc(); // Increment the counter
          res.status(200).json(dailyStats.rows);
      } catch (error) {
          console.error('Error al obtener estadísticas diarias:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
      }
  };

  return { getSummary, getServiceStatistics, getDailyStatistics };
};
