const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Validaciones
const registerValidation = [
  body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
  body('apellido').trim().notEmpty().withMessage('Apellido es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('rut').matches(/^\d{7,8}-[\dkK]$/).withMessage('RUT inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener mínimo 6 caracteres'),
  body('telefono').optional().isMobilePhone('es-CL').withMessage('Teléfono inválido'),
  body('rol').optional().isIn(['ciudadano', 'funcionario', 'administrador']).withMessage('Rol inválido')
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
router.get('/users', authMiddleware, authController.getAllUsers);

module.exports = router;