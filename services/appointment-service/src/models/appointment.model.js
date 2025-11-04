const { pool } = require('../config/database'); // Importamos la conexión a la base de datos desde el archivo de configuración

class Appointment {
  // Método para crear un nuevo agendamiento
  async create(appointmentData) {
    const { usuario_id, servicio_id, fecha_hora, tipo, notas } = appointmentData; // Extraemos los datos necesarios para crear el agendamiento
    const query = `
      INSERT INTO agendamientos (usuario_id, servicio_id, fecha_hora, tipo, notas, estado)
      VALUES ($1, $2, $3, $4, $5, 'pendiente')
      RETURNING *;
    `; // Query para insertar el nuevo agendamiento con estado 'pendiente'
    const values = [usuario_id, servicio_id, fecha_hora, tipo, notas]; // Valores a insertar en la consulta
    const result = await pool.query(query, values); // Ejecutamos la consulta en la base de datos
    return result.rows[0]; // Retornamos el primer registro insertado (el agendamiento recién creado)
  }

  // Método para obtener un agendamiento por su ID
  async findById(id) {
    const query = 'SELECT * FROM agendamientos WHERE id = $1'; // Query para buscar un agendamiento por ID
    const result = await pool.query(query, [id]); // Ejecutamos la consulta con el ID proporcionado
    return result.rows[0]; // Retornamos el primer resultado encontrado
  }

  // Método para obtener todos los agendamientos de un usuario por su ID
  async findByUserId(userId) {
    const query = 'SELECT * FROM agendamientos WHERE usuario_id = $1 ORDER BY fecha_hora'; // Query para buscar los agendamientos de un usuario
    const result = await pool.query(query, [userId]); // Ejecutamos la consulta con el ID del usuario
    return result.rows; // Retornamos todos los agendamientos encontrados para ese usuario
  }

  // Método para obtener todos los agendamientos
  async findAll() {
    const query = 'SELECT * FROM agendamientos ORDER BY fecha_hora'; // Query para obtener todos los agendamientos ordenados por fecha y hora
    const result = await pool.query(query); // Ejecutamos la consulta
    return result.rows; // Retornamos todos los agendamientos
  }

  // Método para actualizar los datos de un agendamiento
  async update(id, appointmentData) {
    // Nota: 'ultima_actualizacion' se maneja con un trigger en la base de datos
    const { fecha_hora, estado, notas } = appointmentData; // Extraemos los datos a actualizar
    const query = `
      UPDATE agendamientos
      SET fecha_hora = COALESCE($1, fecha_hora),
          estado = COALESCE($2, estado),
          notas = COALESCE($3, notas)
      WHERE id = $4
      RETURNING *;
    `; // Query para actualizar el agendamiento con los nuevos valores
    const values = [fecha_hora, estado, notas, id]; // Valores a actualizar
    const result = await pool.query(query, values); // Ejecutamos la consulta en la base de datos
    return result.rows[0]; // Retornamos el agendamiento actualizado
  }

  // Método para cancelar un agendamiento
  async cancel(id) {
    // Nota: 'ultima_actualizacion' se maneja con un trigger en la base de datos
    const query = `
      UPDATE agendamientos 
      SET estado = 'cancelado'
      WHERE id = $1
      RETURNING *;
    `; // Query para cambiar el estado del agendamiento a 'cancelado'
    const result = await pool.query(query, [id]); // Ejecutamos la consulta con el ID proporcionado
    return result.rows[0]; // Retornamos el agendamiento con estado actualizado
  }
}

module.exports = new Appointment(); // Exportamos una instancia de la clase para usarla en otros archivos
