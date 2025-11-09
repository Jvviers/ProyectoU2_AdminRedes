const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

module.exports = (loginSuccessCounter, loginFailedCounter) => {
  const express = require('express');
  const router = express.Router();
  const { body } = require('express-validator');
  const authController = require('../controllers/auth.controller')(loginSuccessCounter, loginFailedCounter);
  const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

  // Creación de middleware de rol específico
  const adminMiddleware = roleMiddleware(['administrador']);

  // Definición de validaciones
  const registerValidation = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('apellido').notEmpty().withMessage('Apellido es requerido'),
    body('rut').notEmpty().withMessage('RUT es requerido')
  ];

  const loginValidation = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña es requerida')
  ];

  // Rutas públicas
  router.post('/register', registerValidation, authController.register);
  router.post('/login', loginValidation, authController.login);
  router.post('/verify-token', authController.verifyToken);

  // Rutas protegidas
  router.get('/profile', authMiddleware, authController.getProfile);
  router.put('/profile', authMiddleware, authController.updateProfile);
  router.post('/logout', authMiddleware, authController.logout);

  // Rutas de administrador
  router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);

  return router;
};