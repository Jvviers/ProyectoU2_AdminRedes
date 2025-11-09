const Direcciones = require('../models/direcciones.model');

class ConfigController {
  constructor(configurationsRetrievedCounter) {
    this.configurationsRetrievedCounter = configurationsRetrievedCounter;
    this.getDirecciones = this.getDirecciones.bind(this);
    this.createDireccion = this.createDireccion.bind(this);
    this.updateDireccion = this.updateDireccion.bind(this);
    this.deleteDireccion = this.deleteDireccion.bind(this);
  }

  async getDirecciones(req, res) {
    try {
      const data = await Direcciones.findAll();
      this.configurationsRetrievedCounter.inc(); // Increment the counter
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error obteniendo direcciones' });
    }
  }

  async createDireccion(req, res) {
    try {
      const nueva = await Direcciones.create(req.body);
      res.status(201).json(nueva);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error creando dirección' });
    }
  }

  async updateDireccion(req, res) {
    try {
      const actualizada = await Direcciones.update(req.params.id, req.body);
      res.json(actualizada);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error actualizando dirección' });
    }
  }

  async deleteDireccion(req, res) {
    try {
      const eliminada = await Direcciones.delete(req.params.id);
      res.json({ message: 'Dirección desactivada', item: eliminada });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error eliminando dirección' });
    }
  }
}

module.exports = (configurationsRetrievedCounter) => new ConfigController(configurationsRetrievedCounter);