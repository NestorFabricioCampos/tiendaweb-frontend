const mongoose = require('mongoose');

const articuloSchema = new mongoose.Schema(
  {
    Articulo: {
      type: String,
      required: true,
      trim: true
    },
    ImagenArt: {
      type: String,
      required: true,
      trim: true,
      default: ''
    },
    Detalles: {
      type: String,
      required: true,
      trim: true
    },
    Precio: {
      type: Number,
      required: false,
      min: 0,
      default: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Articulo', articuloSchema);
