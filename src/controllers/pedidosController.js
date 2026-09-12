const Pedido = require('../models/Pedido');

const estadosProducto = ['pendiente', 'entregado'];

const normalizarItems = (items) => items.map((item) => ({
  ...item,
  estado: estadosProducto.includes(String(item.estado).toLowerCase())
    ? String(item.estado).toLowerCase()
    : 'pendiente'
}));

const createPedido = async (req, res) => {
  try {
    const { cliente, nombreCliente, email, items, total } = req.body;

    if (!cliente || !email || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Los campos cliente, email e items son obligatorios'
      });
    }

    const totalValue = Number(total);
    if (Number.isNaN(totalValue) || totalValue < 0) {
      return res.status(400).json({ message: 'El total debe ser un número mayor o igual a 0' });
    }

    const itemsNormalizados = normalizarItems(items);
    const estadoPedido = itemsNormalizados.every((item) => item.estado === 'entregado')
      ? 'entregado'
      : 'pendiente';

    const pedido = new Pedido({
      numero: `PED-${Date.now()}`,
      cliente: String(cliente).trim(),
      nombreCliente: String(nombreCliente || cliente).trim(),
      email: String(email).trim().toLowerCase(),
      items: itemsNormalizados,
      total: totalValue,
      estado: estadoPedido,
      fecha: new Date()
    });

    const pedidoCreado = await pedido.save();
    res.status(201).json(pedidoCreado);
  } catch (error) {
    res.status(400).json({ message: 'No se pudo registrar la venta', error: error.message });
  }
};

const getAllPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ fecha: -1, createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
  }
};

const updateEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const estadosPermitidos = ['pendiente', 'entregado'];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        message: 'El estado debe ser pendiente o entregado'
      });
    }

    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const itemsActualizados = Array.isArray(pedido.items)
      ? pedido.items.map((item) => ({ ...item.toObject?.() || item, estado }))
      : pedido.items;

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      id,
      { $set: { estado, items: itemsActualizados } },
      { new: true, runValidators: true }
    );
    res.json(pedidoActualizado);
  } catch (error) {
    res.status(400).json({ message: 'No se pudo actualizar el estado del pedido', error: error.message });
  }
};

module.exports = {
  getAllPedidos,
  createPedido,
  updateEstadoPedido
};
