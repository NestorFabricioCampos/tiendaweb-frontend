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

const router = express.Router();

router.get('/', getAllArticulos);
router.get('/:id', getArticuloById);
router.post('/imagen', upload.single('imagen'), uploadImagenArticulo);
router.post('/', createArticulo);
router.put('/:id', updateArticulo);
router.delete('/:id', deleteArticulo);

module.exports = router;
