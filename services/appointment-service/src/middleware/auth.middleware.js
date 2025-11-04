const jwt = require('jsonwebtoken');

// Este es un middleware de autenticación simplificado. En una arquitectura real de microservicios,
// probablemente implicaría una llamada a una API del servicio de autenticación para verificar el token.
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization; // Obtenemos el header de autorización
    if (!authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado' }); // Si no se proporciona el token, respondemos con un 401
    }

    const token = authHeader.split(' ')[1]; // Extraemos el token del header (formato: "Bearer <token>")
    if (!token) {
      return res.status(401).json({ error: 'Formato de token inválido' }); // Si el formato del token es incorrecto, respondemos con un 401
    }

    // Este secreto debe ser el mismo que el usado en el servicio de autenticación
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificamos el token usando la clave secreta

    // Almacenamos la información del usuario decodificada en el objeto 'user' de la request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    next(); // Llamamos al siguiente middleware o función
  } catch (error) {
    // Si el token no es válido, respondemos con un 401
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    // Si el token ha expirado, respondemos con un 401
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    console.error('Error en middleware de autenticación:', error); // Si ocurre otro tipo de error, lo mostramos en consola
    res.status(500).json({ error: 'Error de autenticación' }); // Respondemos con un error 500 si ocurrió un fallo inesperado
  }
}

// Middleware para verificar el rol del usuario
function roleMiddleware(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' }); // Si el usuario no está autenticado, respondemos con un 401
    }

    // Verificamos si el rol del usuario está en la lista de roles permitidos
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado para esta acción' }); // Si el rol no está permitido, respondemos con un 403
    }

    next(); // Si el usuario tiene el rol adecuado, llamamos al siguiente middleware o función
  };
}

module.exports = { authMiddleware, roleMiddleware }; // Exportamos ambos middlewares para usarlos en otras partes de la aplicación
