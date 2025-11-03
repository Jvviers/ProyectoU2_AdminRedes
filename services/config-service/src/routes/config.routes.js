const express = require('express');
const router = express.Router();
const controller = require('../controllers/config.controller');

// Rutas CRUD para direcciones
router.get('/direcciones', controller.getDirecciones);
router.post('/direcciones', controller.createDireccion);
router.put('/direcciones/:id', controller.updateDireccion);
router.delete('/direcciones/:id', controller.deleteDireccion);

module.exports = router;