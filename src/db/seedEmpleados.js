require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Empleado = require('../models/Empleado');

const empleadosBase = [
  ['encargado1', 'Encargado 1', 'encargado'],
  ['encargado2', 'Encargado 2', 'encargado'],
  ['vendedor1', 'Vendedor 1', 'vendedor'],
  ['vendedor2', 'Vendedor 2', 'vendedor'],
  ['vendedor3', 'Vendedor 3', 'vendedor'],
  ['vendedor4', 'Vendedor 4', 'vendedor'],
  ['vendedor5', 'Vendedor 5', 'vendedor'],
  ['vendedor6', 'Vendedor 6', 'vendedor'],
  ['vendedor7', 'Vendedor 7', 'vendedor'],
  ['vendedor8', 'Vendedor 8', 'vendedor']
];

const createPassword = () => `Tienda-${crypto.randomBytes(7).toString('base64url')}!`;

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tiendaweb');
  const credentials = [];

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD_HASH son obligatorios para crear el administrador');
  }

  await Empleado.findOneAndUpdate(
    { email: process.env.ADMIN_EMAIL.trim().toLowerCase() },
    {
      nombre: 'Administrador',
      email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
      passwordHash: process.env.ADMIN_PASSWORD_HASH,
      role: 'admin',
      activo: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  for (const [alias, nombre, role] of empleadosBase) {
    const email = `${alias}@tiendaweb.local`;
    const existing = await Empleado.findOne({ email }).select('+passwordHash');

    if (existing) {
      await Empleado.updateOne(
        { _id: existing._id },
        { $set: { nombre, email, role, activo: true } }
      );
      credentials.push({ nombre, role, email, password: '[existente: no regenerada]' });
      continue;
    }

    const password = createPassword();
    const passwordHash = await bcrypt.hash(password, 12);
    await Empleado.create({ nombre, email, passwordHash, role, activo: true });
    credentials.push({ nombre, role, email, password });
  }

  console.log('Empleados creados o actualizados. Guarda estas credenciales en un gestor seguro:');
  console.log('Administrador:', process.env.ADMIN_EMAIL);
  console.table(credentials);
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error('No se pudieron crear los empleados:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
