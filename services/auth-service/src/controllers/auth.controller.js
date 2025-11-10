const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { getRedisClient } = require('../config/redis');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Helper function to get the backup service container name
const getBackupServiceContainerName = async () => {
  const { stdout } = await execPromise('docker ps --filter "name=backup-service" --format "{{.Names}}"');
  return stdout.trim();
};

class AuthController {
  constructor(loginSuccessCounter, loginFailedCounter) {
    this.loginSuccessCounter = loginSuccessCounter;
    this.loginFailedCounter = loginFailedCounter;

    // Bindeamos el 'this' para todos los métodos que se usarán como handlers
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.logout = this.logout.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.backupDb = this.backupDb.bind(this);
    this.backupConfigs = this.backupConfigs.bind(this);
    this.listBackups = this.listBackups.bind(this);
    this.restoreDb = this.restoreDb.bind(this);
  }

  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { nombre, apellido, email, rut, password, telefono, rol } = req.body;

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
        apellido,
        email,
        rut,
        password_hash: passwordHash,
        telefono,
        rol: rol || 'ciudadano'
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
        this.loginFailedCounter.inc(); // Increment failed counter for validation errors
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        this.loginFailedCounter.inc(); // Increment failed counter for user not found
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        this.loginFailedCounter.inc(); // Increment failed counter for wrong password
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      if (!user.activo) {
        this.loginFailedCounter.inc(); // Increment failed counter for inactive user
        return res.status(403).json({ error: 'Usuario desactivado' });
      }

      try {
        await User.updateLastAccess(user.id);
      } catch (updateError) {
        // Postgres error code for read-only transaction
        if (updateError.code === '25006') {
          console.warn(`ADVERTENCIA: No se pudo actualizar la última fecha de acceso para el usuario ${user.id} debido a que la base de datos está en modo de solo lectura. El login continuará.`);
        } else {
          // For any other error, re-throw it to be caught by the main handler
          throw updateError;
        }
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '24h' }
      );

      const redis = getRedisClient();
      await redis.setEx(`session:${user.id}`, 86400, token);

      this.loginSuccessCounter.inc(); // Increment successful login counter

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
      this.loginFailedCounter.inc(); // Increment failed counter for other errors
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

  async backupDb(req, res) {
    try {
      const backupServiceContainerName = await getBackupServiceContainerName();
      if (!backupServiceContainerName) {
        return res.status(500).json({ error: 'Contenedor de backup no encontrado.' });
      }
      const command = `docker exec ${backupServiceContainerName} /bin/bash /usr/local/bin/backup_db.sh`;
      const { stdout, stderr } = await execPromise(command);
      if (stderr) {
        console.error(`Error en backupDb: ${stderr}`);
        return res.status(500).json({ error: 'Error al realizar backup de base de datos', details: stderr });
      }
      res.json({ message: 'Backup de base de datos iniciado exitosamente', output: stdout });
    } catch (error) {
      console.error('Error en backupDb:', error);
      res.status(500).json({ error: 'Error al realizar backup de base de datos', details: error.message });
    }
  }

  async backupConfigs(req, res) {
    try {
      const backupServiceContainerName = await getBackupServiceContainerName();
      if (!backupServiceContainerName) {
        return res.status(500).json({ error: 'Contenedor de backup no encontrado.' });
      }
      const command = `docker exec ${backupServiceContainerName} /bin/bash /usr/local/bin/backup_configs.sh`;
      const { stdout, stderr } = await execPromise(command);
      if (stderr) {
        console.error(`Error en backupConfigs: ${stderr}`);
        return res.status(500).json({ error: 'Error al realizar backup de configuraciones', details: stderr });
      }
      res.json({ message: 'Backup de configuraciones iniciado exitosamente', output: stdout });
    } catch (error) {
      console.error('Error en backupConfigs:', error);
      res.status(500).json({ error: 'Error al realizar backup de configuraciones', details: error.message });
    }
  }

  async listBackups(req, res) {
    try {
      const backupServiceContainerName = await getBackupServiceContainerName();
      if (!backupServiceContainerName) {
        return res.status(500).json({ error: 'Contenedor de backup no encontrado.' });
      }
      const command = `docker exec ${backupServiceContainerName} ls -l /backups`;
      const { stdout } = await execPromise(command);

      const lines = stdout.trim().split('\n').slice(1); // Skip total line
      const backups = lines.map(line => {
        const parts = line.split(/\s+/);
        // Example line: -rw-r--r--    1 root     root         3732 Nov  9 23:56 db_backup_20251109235652.sql.gz
        // parts[4] = size, parts[5] = month, parts[6] = day, parts[7] = time/year, parts[8] = filename
        const size = parseInt(parts[4], 10);
        const month = parts[5];
        const day = parts[6];
        let yearOrTime = parts[7];
        const filename = parts[8];

        let mtime;
        // Heuristic to determine if parts[7] is a year or time
        if (yearOrTime.includes(':')) { // It's a time, so it's current year
          const currentYear = new Date().getFullYear();
          mtime = new Date(`${month} ${day}, ${currentYear} ${yearOrTime}`);
        } else { // It's a year
          mtime = new Date(`${month} ${day}, ${yearOrTime}`);
        }
        
        return { filename, size, mtime: mtime.toISOString() };
      }).filter(backup => backup.filename !== 'old_dummy_file.txt'); // Filter out dummy file if it exists

      res.json(backups);
    } catch (error) {
      console.error('Error en listBackups:', error);
      res.status(500).json({ error: 'Error al listar backups', details: error.message });
    }
  }

  async restoreDb(req, res) {
    try {
      const { filename } = req.body;
      if (!filename) {
        return res.status(400).json({ error: 'Nombre de archivo de backup no proporcionado.' });
      }

      const backupServiceContainerName = await getBackupServiceContainerName();
      if (!backupServiceContainerName) {
        return res.status(500).json({ error: 'Contenedor de backup no encontrado.' });
      }
      const command = `docker exec ${backupServiceContainerName} /bin/bash /usr/local/bin/restore_db.sh /backups/${filename}`;
      const { stdout, stderr } = await execPromise(command);
      if (stderr && !stderr.includes('unrecognized configuration parameter "transaction_timeout"')) {
        console.error(`Error en restoreDb: ${stderr}`);
        return res.status(500).json({ error: 'Error al restaurar base de datos', details: stderr });
      }
      res.json({ message: `Restauración de base de datos desde ${filename} iniciada exitosamente`, output: stdout });
    } catch (error) {
      console.error('Error en restoreDb:', error);
      res.status(500).json({ error: 'Error al restaurar base de datos', details: error.message });
    }
  }
}

module.exports = (loginSuccessCounter, loginFailedCounter) => new AuthController(loginSuccessCounter, loginFailedCounter);