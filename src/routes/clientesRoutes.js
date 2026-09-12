const express = require('express');
const { writeLimiter } = require('../middleware/security');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
} = require('../controllers/clientesController');

const router = express.Router();
router.use(authenticateToken, authorizeRoles('admin', 'encargado'));

router.get('/', getAllClientes);
router.get('/:id', getClienteById);
router.post('/', writeLimiter, createCliente);
router.put('/:id', writeLimiter, updateCliente);
router.delete('/:id', writeLimiter, deleteCliente);

module.exports = router;
