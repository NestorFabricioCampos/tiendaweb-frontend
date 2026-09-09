const express = require('express');
const {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
} = require('../controllers/clientesController');

const router = express.Router();

router.get('/', getAllClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

module.exports = router;
