const bcrypt = require('bcryptjs');
const Empleado = require('../models/Empleado');

const rolesPermitidos = ['encargado', 'vendedor'];

const convertirCategoriaARol = (categoria) => {
  const rol = String(categoria || '').trim().toLowerCase();
  return rol === 'encargado' ? 'encargado' : rol === 'vendedor' ? 'vendedor' : null;
};

const empleadoPublico = (empleado) => ({
  _id: empleado._id,
  nombre: empleado.nombre,
  apellido: empleado.apellido || '',
  email: empleado.email,
  telefono: empleado.telefono || '',
  categoria: empleado.role === 'encargado' ? 'Encargado' : 'Vendedor',
  rol: empleado.role,
  activo: empleado.activo
});

const getAllEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.find({ role: { $in: rolesPermitidos } }).sort({ createdAt: -1 });
    res.json(empleados.map(empleadoPublico));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener empleados' });
  }
};

const createEmpleado = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, categoria, password, activo } = req.body;
    const role = convertirCategoriaARol(categoria);

    if (!nombre || !email || !password || !role) {
      return res.status(400).json({ message: 'Nombre, email, categoría y contraseña son obligatorios' });
    }

    const empleado = await Empleado.create({
      nombre: String(nombre).trim(),
      apellido: String(apellido || '').trim(),
      email: String(email).trim().toLowerCase(),
      telefono: String(telefono || '').trim(),
      passwordHash: await bcrypt.hash(String(password), 12),
      role,
      activo: activo !== false
    });

    res.status(201).json(empleadoPublico(empleado));
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'El email ya está registrado' });
    res.status(400).json({ message: 'No se pudo crear el empleado' });
  }
};

const updateEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findById(req.params.id).select('+passwordHash');
    if (!empleado || !rolesPermitidos.includes(empleado.role)) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    const { nombre, apellido, email, telefono, categoria, password, activo } = req.body;
    const role = categoria === undefined ? empleado.role : convertirCategoriaARol(categoria);
    if (!role) return res.status(400).json({ message: 'La categoría no es válida' });

    if (nombre !== undefined) empleado.nombre = String(nombre).trim();
    if (apellido !== undefined) empleado.apellido = String(apellido).trim();
    if (email !== undefined) empleado.email = String(email).trim().toLowerCase();
    if (telefono !== undefined) empleado.telefono = String(telefono).trim();
    if (password) empleado.passwordHash = await bcrypt.hash(String(password), 12);
    if (activo !== undefined) empleado.activo = activo === true || activo === 'true';
    empleado.role = role;

    await empleado.save();
    res.json(empleadoPublico(empleado));
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'El email ya está registrado' });
    res.status(400).json({ message: 'No se pudo actualizar el empleado' });
  }
};

const deleteEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findOneAndDelete({
      _id: req.params.id,
      role: { $in: rolesPermitidos }
    });
    if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ message: 'No se pudo eliminar el empleado' });
  }
};

module.exports = { getAllEmpleados, createEmpleado, updateEmpleado, deleteEmpleado };