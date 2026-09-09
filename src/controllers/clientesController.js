const Cliente = require('../models/Cliente');

const getAllClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
  }
};

const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    res.status(400).json({ message: 'ID inválido', error: error.message });
  }
};

const createCliente = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion, ciudad, documento, fechaNacimiento, activo } = req.body;

    if (!nombre || !apellido || !email || !telefono || !documento) {
      return res.status(400).json({
        message: 'Los campos nombre, apellido, email, telefono y documento son obligatorios'
      });
    }

    const cliente = new Cliente({
      nombre: String(nombre).trim(),
      apellido: String(apellido).trim(),
      email: String(email).trim().toLowerCase(),
      telefono: String(telefono).trim(),
      direccion: String(direccion).trim(),
      ciudad: String(ciudad).trim(),
      documento: String(documento).trim(),
      fechaNacimiento: fechaNacimiento || null,
      activo: activo !== undefined ? Boolean(activo) : true
    });

    const clienteCreado = await cliente.save();
    res.status(201).json(clienteCreado);
  } catch (error) {
    // Manejo de errores de validación de MongoDB
    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `El ${campo} ya está registrado` 
      });
    }
    res.status(400).json({ message: 'No se pudo crear el cliente', error: error.message });
  }
};

const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, direccion, ciudad, documento, fechaNacimiento, activo } = req.body;

    const clienteActual = await Cliente.findById(id);

    if (!clienteActual) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    if (nombre !== undefined) clienteActual.nombre = String(nombre).trim();
    if (apellido !== undefined) clienteActual.apellido = String(apellido).trim();
    if (email !== undefined) clienteActual.email = String(email).trim().toLowerCase();
    if (telefono !== undefined) clienteActual.telefono = String(telefono).trim();
    if (direccion !== undefined) clienteActual.direccion = String(direccion).trim();
    if (ciudad !== undefined) clienteActual.ciudad = String(ciudad).trim();
    if (documento !== undefined) clienteActual.documento = String(documento).trim();
    if (fechaNacimiento !== undefined) clienteActual.fechaNacimiento = fechaNacimiento;
    if (activo !== undefined) clienteActual.activo = Boolean(activo);

    const clienteActualizado = await clienteActual.save();
    res.json(clienteActualizado);
  } catch (error) {
    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `El ${campo} ya está registrado` 
      });
    }
    res.status(400).json({ message: 'No se pudo actualizar el cliente', error: error.message });
  }
};

const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByIdAndDelete(id);

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado correctamente', cliente });
  } catch (error) {
    res.status(400).json({ message: 'No se pudo eliminar el cliente', error: error.message });
  }
};

module.exports = {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
};
