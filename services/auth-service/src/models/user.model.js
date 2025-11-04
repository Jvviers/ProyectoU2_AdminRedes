const { pool } = require('../config/database');

class User {
  async create(userData) {
    const { nombre, apellido, email, rut, password_hash, telefono, rol } = userData;
    
    const query = `
      INSERT INTO usuarios (nombre, apellido, email, rut, password_hash, telefono, rol)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, nombre, apellido, email, rut, telefono, rol, fecha_creacion, activo
    `;
    
    const values = [nombre, apellido, email, rut, password_hash, telefono, rol || 'ciudadano'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async findByRut(rut) {
    const query = 'SELECT * FROM usuarios WHERE rut = $1';
    const result = await pool.query(query, [rut]);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM usuarios WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async findAll() {
    const query = `
      SELECT id, nombre, email, rut, telefono, rol, fecha_creacion, ultima_actualizacion, activo 
      FROM usuarios 
      ORDER BY fecha_creacion DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async update(id, userData) {
    const { nombre, telefono } = userData;
    const query = `
      UPDATE usuarios 
      SET nombre = COALESCE($1, nombre),
          telefono = COALESCE($2, telefono)
      WHERE id = $3
      RETURNING id, nombre, email, rut, telefono, rol, fecha_creacion, activo
    `;
    const values = [nombre, telefono, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateLastAccess(id) {
    const query = 'UPDATE usuarios SET ultima_actualizacion = CURRENT_TIMESTAMP WHERE id = $1';
    await pool.query(query, [id]);
  }

  async delete(id) {
    const query = 'UPDATE usuarios SET activo = false WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = new User();