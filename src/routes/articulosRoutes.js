const express = require('express');
const {
  getAllArticulos,
  getArticuloById,
  uploadImagenArticulo,
  createArticulo,
  updateArticulo,
  deleteArticulo
} = require('../controllers/articulosController');
const upload = require('../middleware/uploadImagen');
const { writeLimiter } = require('../middleware/security');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, authorizeRoles('admin', 'encargado', 'vendedor'));

router.get('/', getAllArticulos);
router.get('/:id', getArticuloById);
router.post('/imagen', writeLimiter, upload.single('imagen'), uploadImagenArticulo);
router.post('/', writeLimiter, createArticulo);
router.put('/:id', writeLimiter, updateArticulo);
router.delete('/:id', writeLimiter, deleteArticulo);

module.exports = router;
