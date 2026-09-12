const express = require('express');
const { writeLimiter } = require('../middleware/security');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado
} = require('../controllers/empleadosController');

const router = express.Router();
router.use(authenticateToken, authorizeRoles('admin', 'encargado'));

router.get('/', getAllEmpleados);
router.post('/', writeLimiter, createEmpleado);
router.put('/:id', writeLimiter, updateEmpleado);
router.delete('/:id', writeLimiter, deleteEmpleado);

module.exports = router;