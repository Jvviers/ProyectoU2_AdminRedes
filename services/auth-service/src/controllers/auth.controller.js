const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { getRedisClient } = require('../config/redis');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { nombre, email, rut, password, telefono } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const existingRut = await User.findByRut(rut);
      if (existingRut) {
        return res.status(400).json({ error: 'El RUT ya está registrado' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        nombre,
        email,
        rut,
        password_hash: passwordHash,
        telefono,
        rol: 'ciudadano'
      });

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, rol: newUser.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '24h' }
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: newUser.id,
          nombre: newUser.nombre,
          email: newUser.email,
          rut: newUser.rut,
          rol: newUser.rol
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      if (!user.activo) {
        return res.status(403).json({ error: 'Usuario desactivado' });
      }

      await User.updateLastAccess(user.id);

      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '24h' }
      );

      const redis = getRedisClient();
      await redis.setEx(`session:${user.id}`, 86400, token);

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rut: user.rut,
          rol: user.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }

  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ valid: false, error: 'Token no proporcionado' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const redis = getRedisClient();
      const sessionToken = await redis.get(`session:${decoded.id}`);
      
      if (!sessionToken) {
        return res.status(401).json({ valid: false, error: 'Sesión expirada' });
      }

      res.json({ valid: true, user: decoded });
    } catch (error) {
      res.status(401).json({ valid: false, error: 'Token inválido' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const { password_hash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { nombre, telefono } = req.body;
      const updatedUser = await User.update(req.user.id, { nombre, telefono });
      
      const { password_hash, ...userWithoutPassword } = updatedUser;
      res.json({
        message: 'Perfil actualizado',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  }

  async logout(req, res) {
    try {
      const redis = getRedisClient();
      await redis.del(`session:${req.user.id}`);
      res.json({ message: 'Logout exitoso' });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ error: 'Error al cerrar sesión' });
    }
  }

  async getAllUsers(req, res) {
    try {
      if (req.user.rol !== 'administrador') {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }
}

module.exports = new AuthController();