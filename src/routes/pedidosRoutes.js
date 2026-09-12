const express = require('express');
const { getAllPedidos, createPedido, updateEstadoPedido } = require('../controllers/pedidosController');
const { writeLimiter } = require('../middleware/security');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, authorizeRoles('admin', 'encargado', 'vendedor'));

router.get('/', getAllPedidos);
router.post('/', writeLimiter, createPedido);
router.put('/:id/estado', writeLimiter, updateEstadoPedido);

module.exports = router;
