const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      trim: true
    },
    cliente: {
      type: mongoose.Schema.Types.Mixed
    },
    nombreCliente: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    fecha: {
      type: Date
    },
    total: {
      type: Number,
      min: 0,
      default: 0
    },
    estado: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'pendiente'
    }
  },
  {
    timestamps: true,
    strict: false
  }
);

module.exports = mongoose.model('Pedido', pedidoSchema);
