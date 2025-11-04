const { pool } = require('../config/database');

class Appointment {
  // Método para crear un nuevo agendamiento
  async create(appointmentData) {
    const { usuario_id, servicio_id, fecha_hora, tipo, notas } = appointmentData;
    const query = `
      INSERT INTO agendamientos (usuario_id, servicio_id, fecha_hora, tipo, notas, estado)
      VALUES ($1, $2, $3, $4, $5, 'pendiente')
      RETURNING *;
    `;
    const values = [usuario_id, servicio_id, fecha_hora, tipo, notas];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Método para obtener un agendamiento por su ID
  async findById(id) {
    const query = 'SELECT * FROM agendamientos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Método para obtener todos los agendamientos de un usuario por su ID
  async findByUserId(userId) {
    const query = 'SELECT * FROM agendamientos WHERE usuario_id = $1 ORDER BY fecha_hora';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Método para obtener todos los agendamientos
  async findAll() {
    const query = 'SELECT * FROM agendamientos ORDER BY fecha_hora';
    const result = await pool.query(query);
    return result.rows;
  }

  // Método para actualizar los datos de un agendamiento
  async update(id, appointmentData) {
    // Note: ultima_actualizacion is handled by a database trigger
    const { fecha_hora, estado, notas } = appointmentData;
    const query = `
      UPDATE agendamientos
      SET fecha_hora = COALESCE($1, fecha_hora),
          estado = COALESCE($2, estado),
          notas = COALESCE($3, notas)
      WHERE id = $4
      RETURNING *;
    `;
    const values = [fecha_hora, estado, notas, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Método para cancelar un agendamiento
  async cancel(id) {
    // Note: ultima_actualizacion is handled by a database trigger
    const query = `
      UPDATE agendamientos 
      SET estado = 'cancelado'
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new Appointment();
