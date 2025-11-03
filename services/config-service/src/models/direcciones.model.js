const { pool } = require('../config/database');

class DireccionesModel {
  async findAll() {
    const result = await pool.query('SELECT * FROM direcciones_municipales ORDER BY fecha_creacion DESC');
    return result.rows;
  }

  async create(data) {
    const { nombre, direccion, telefono, email, horario_atencion } = data;
    const query = `
      INSERT INTO direcciones_municipales (nombre, direccion, telefono, email, horario_atencion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [nombre, direccion, telefono, email, horario_atencion];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async update(id, data) {
    const { nombre, direccion, telefono, email, horario_atencion, activo } = data;
    const query = `
      UPDATE direcciones_municipales
      SET nombre = COALESCE($1, nombre),
          direccion = COALESCE($2, direccion),
          telefono = COALESCE($3, telefono),
          email = COALESCE($4, email),
          horario_atencion = COALESCE($5, horario_atencion),
          activo = COALESCE($6, activo)
      WHERE id = $7
      RETURNING *;
    `;
    const values = [nombre, direccion, telefono, email, horario_atencion, activo, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query(
      'UPDATE direcciones_municipales SET activo = false WHERE id = $1 RETURNING *;',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new DireccionesModel();