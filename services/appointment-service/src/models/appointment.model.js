const { pool } = require('../config/database'); // Importamos la conexión a la base de datos

class Appointment {
  // Método para crear una nueva cita
  async create(appointmentData) {
    const { fecha_cita, hora_cita, usuario_id, tramite_id, direccion_id } = appointmentData;
    const query = `
      INSERT INTO citas (fecha_cita, hora_cita, usuario_id, tramite_id, direccion_id, estado)
      VALUES ($1, $2, $3, $4, $5, 'pendiente')
      RETURNING *;
    `; // Query para insertar una nueva cita en la base de datos, con el estado 'pendiente'
    const values = [fecha_cita, hora_cita, usuario_id, tramite_id, direccion_id]; // Valores a insertar
    const result = await pool.query(query, values); // Ejecutamos la consulta
    return result.rows[0]; // Retornamos la primera fila (la cita recién creada)
  }

  // Método para obtener una cita por su ID
  async findById(id) {
    const query = 'SELECT * FROM citas WHERE id = $1'; // Query para buscar la cita por su ID
    const result = await pool.query(query, [id]); // Ejecutamos la consulta
    return result.rows[0]; // Retornamos la cita encontrada
  }

  // Método para obtener todas las citas de un usuario por su ID
  async findByUserId(userId) {
    const query = 'SELECT * FROM citas WHERE usuario_id = $1 ORDER BY fecha_cita, hora_cita'; // Query para buscar todas las citas de un usuario
    const result = await pool.query(query, [userId]); // Ejecutamos la consulta
    return result.rows; // Retornamos todas las citas del usuario
  }

  // Método para obtener todas las citas (para un administrador, por ejemplo)
  async findAll() {
    const query = 'SELECT * FROM citas ORDER BY fecha_cita, hora_cita'; // Query para obtener todas las citas ordenadas por fecha y hora
    const result = await pool.query(query); // Ejecutamos la consulta
    return result.rows; // Retornamos todas las citas
  }

  // Método para actualizar los datos de una cita
  async update(id, appointmentData) {
    const { fecha_cita, hora_cita, estado } = appointmentData;
    const query = `
      UPDATE citas
      SET fecha_cita = COALESCE($1, fecha_cita),
          hora_cita = COALESCE($2, hora_cita),
          estado = COALESCE($3, estado),
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `; // Query para actualizar los datos de la cita
    const values = [fecha_cita, hora_cita, estado, id]; // Valores a actualizar
    const result = await pool.query(query, values); // Ejecutamos la consulta
    return result.rows[0]; // Retornamos la cita actualizada
  }

  // Método para cancelar una cita (en lugar de borrarla)
  async delete(id) {
    const query = `
      UPDATE citas 
      SET estado = 'cancelada', fecha_actualizacion = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING *;
    `; // Query para cambiar el estado de la cita a 'cancelada'
    const result = await pool.query(query, [id]); // Ejecutamos la consulta
    return result.rows[0]; // Retornamos la cita cancelada
  }
}

module.exports = new Appointment(); // Exportamos la clase como una instancia para poder usarla en otros archivos
