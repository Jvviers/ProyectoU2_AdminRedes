const jwt = require('jsonwebtoken');
const { getRedisClient } = require('../config/redis');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Formato de token inválido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const redis = getRedisClient();
    const sessionToken = await redis.get(`session:${decoded.id}`);
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'Sesión expirada o inválida' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
}

function roleMiddleware(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado para esta acción' });
    }

    next();
  };
}

module.exports = { authMiddleware, roleMiddleware };