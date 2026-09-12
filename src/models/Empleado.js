const mongoose = require('mongoose');

const empleadoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    apellido: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    telefono: {
      type: String,
      trim: true,
      default: ''
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'encargado', 'vendedor'],
      required: true
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Empleado', empleadoSchema);
