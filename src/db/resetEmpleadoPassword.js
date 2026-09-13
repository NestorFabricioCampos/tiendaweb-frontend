require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Empleado = require('../models/Empleado');

const email = (process.env.RESET_EMAIL || '').trim().toLowerCase();
const password = process.env.RESET_PASSWORD || '';

const resetPassword = async () => {
  if (!email || !password) {
    throw new Error('RESET_EMAIL y RESET_PASSWORD son obligatorios');
  }

  if (password.length < 8) {
    throw new Error('RESET_PASSWORD debe tener al menos 8 caracteres');
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tiendaweb');
  const passwordHash = await bcrypt.hash(password, 12);
  const empleado = await Empleado.findOneAndUpdate(
    { email },
    { $set: { passwordHash, activo: true } },
    { new: true }
  );

  if (!empleado) throw new Error(`No existe un empleado con el correo ${email}`);
  console.log(`Contraseña actualizada para ${empleado.email} (${empleado.role}).`);
};

resetPassword()
  .catch((error) => {
    console.error('No se pudo restablecer la contraseña:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });