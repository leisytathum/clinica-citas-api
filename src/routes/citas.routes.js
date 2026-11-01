// Rutas de /api/citas
const { Router } = require('express');
const {
  obtenerCitas,
  obtenerCitaPorId,
  obtenerDisponibilidad,
  cancelarCita
} = require('../controllers/citas.controller');

const router = Router();

// Valida que :id sea un número entero
const validarId = (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ mensaje: 'El id debe ser un número entero' });
  }
  next();
};

router.get('/', obtenerCitas);
// IMPORTANTE: esta ruta va ANTES de '/:id', si no Express pensaría que "disponibilidad" es un id
router.get('/disponibilidad/:fecha', obtenerDisponibilidad);
router.get('/:id', validarId, obtenerCitaPorId);
router.delete('/:id', validarId, cancelarCita);

module.exports = router;
