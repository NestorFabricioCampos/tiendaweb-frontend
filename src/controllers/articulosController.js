const Articulo = require('../models/Articulo');
const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'tiendaweb/articulos',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });

const getAllArticulos = async (req, res) => {
  try {
    const articulos = await Articulo.find().sort({ createdAt: -1 });
    res.json(articulos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener artículos', error: error.message });
  }
};

const getArticuloById = async (req, res) => {
  try {
    const { id } = req.params;
    const articulo = await Articulo.findById(id);

    if (!articulo) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    res.json(articulo);
  } catch (error) {
    res.status(400).json({ message: 'ID inválido', error: error.message });
  }
};

const uploadImagenArticulo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Debes enviar una imagen en el campo "imagen"' });
    }

    const resultado = await uploadBufferToCloudinary(req.file.buffer);

    res.status(201).json({
      message: 'Imagen subida correctamente',
      ImagenArt: resultado.secure_url,
      publicId: resultado.public_id
    });
  } catch (error) {
    res.status(502).json({ message: 'No se pudo subir la imagen a Cloudinary', error: error.message });
  }
};

const createArticulo = async (req, res) => {
  try {
    const { Articulo: nombre, ImagenArt, Detalles, Precio, stock } = req.body;

    if (!nombre || !ImagenArt || !Detalles) {
      return res.status(400).json({
        message: 'Los campos Articulo, ImagenArt y Detalles son obligatorios'
      });
    }

    const stockValue = stock === undefined ? 5 : Number(stock);
    const precioValue = Precio === undefined ? 0 : Number(Precio);

    if (Number.isNaN(stockValue) || stockValue < 0) {
      return res.status(400).json({ message: 'El campo stock debe ser un número mayor o igual a 0' });
    }

    if (Number.isNaN(precioValue) || precioValue < 0) {
      return res.status(400).json({ message: 'El campo Precio debe ser un número mayor o igual a 0' });
    }

    const articulo = new Articulo({
      Articulo: String(nombre).trim(),
      ImagenArt: String(ImagenArt).trim(),
      Detalles: String(Detalles).trim(),
      Precio: precioValue,
      stock: stockValue
    });

    const articuloCreado = await articulo.save();
    res.status(201).json(articuloCreado);
  } catch (error) {
    res.status(400).json({ message: 'No se pudo crear el artículo', error: error.message });
  }
};

const updateArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { Articulo: nombre, ImagenArt, Detalles, Precio, stock } = req.body;

    const articuloActual = await Articulo.findById(id);

    if (!articuloActual) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    if (nombre !== undefined) articuloActual.Articulo = String(nombre).trim();
    if (ImagenArt !== undefined) articuloActual.ImagenArt = String(ImagenArt).trim();
    if (Detalles !== undefined) articuloActual.Detalles = String(Detalles).trim();
    if (Precio !== undefined) {
      const precioValue = Number(Precio);
      if (Number.isNaN(precioValue) || precioValue < 0) {
        return res.status(400).json({ message: 'El campo Precio debe ser un número mayor o igual a 0' });
      }
      articuloActual.Precio = precioValue;
    }
    if (stock !== undefined) {
      const stockValue = Number(stock);
      if (Number.isNaN(stockValue) || stockValue < 0) {
        return res.status(400).json({ message: 'El campo stock debe ser un número mayor o igual a 0' });
      }
      articuloActual.stock = stockValue;
    }

    const articuloActualizado = await articuloActual.save();
    res.json(articuloActualizado);
  } catch (error) {
    res.status(400).json({ message: 'No se pudo actualizar el artículo', error: error.message });
  }
};

const deleteArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    const articuloEliminado = await Articulo.findByIdAndDelete(id);

    if (!articuloEliminado) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    res.json({ message: 'Artículo eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ message: 'ID inválido', error: error.message });
  }
};

module.exports = {
  getAllArticulos,
  getArticuloById,
  uploadImagenArticulo,
  createArticulo,
  updateArticulo,
  deleteArticulo
};
