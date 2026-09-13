export const STAFF_ROLES = ['admin', 'encargado']

export const canAccessManagement = (role) => STAFF_ROLES.includes(role)

export const getStockStatus = (quantity) => {
  const stock = Number(quantity) || 0
  if (stock === 0) return 'sin-stock'
  if (stock < 5) return 'bajo-stock'
  if (stock < 10) return 'medio-stock'
  return 'buen-stock'
}

export const filterInventory = (items, search = '', stockFilter = 'todos') => {
  const normalizedSearch = search.toLowerCase()

  return items.filter((item) => {
    const name = (item.Articulo || '').toLowerCase()
    const stock = Number(item.stock) || 0
    if (!name.includes(normalizedSearch)) return false
    if (stockFilter === 'sin-stock') return stock === 0
    if (stockFilter === 'bajo-stock') return stock > 0 && stock < 5
    if (stockFilter === 'medio-stock') return stock >= 5 && stock < 10
    if (stockFilter === 'disponible') return stock >= 5
    return true
  })
}

export const getOrderItems = (order) => Array.isArray(order.items) ? order.items : []

export const getOrderStatus = (order) => {
  const items = getOrderItems(order)
  return items.length > 0 && items.every((item) => item.estado === 'entregado')
    ? 'entregado'
    : 'pendiente'
}

export const getOrderTotal = (order) => Number(order.total || order.totalPedido || 0)

export const filterOrders = (orders, search = '', status = 'todos') => {
  const normalizedSearch = search.toLowerCase()

  return orders.filter((order) => {
    const number = order.numero || order.numeroPedido || order._id || ''
    const customer = typeof order.cliente === 'string'
      ? order.cliente
      : order.cliente
        ? `${order.cliente.nombre || ''} ${order.cliente.apellido || ''}`.trim()
        : order.nombreCliente || order.email || 'Cliente sin nombre'
    const matchesSearch = `${number} ${customer}`.toLowerCase().includes(normalizedSearch)
    return matchesSearch && (status === 'todos' || getOrderStatus(order) === status)
  })
}

export const addToCart = (cart, product) => {
  const stock = Number(product.stock) || 0
  if (stock < 1) return cart

  const existing = cart.find((item) => item._id === product._id)
  if (existing) {
    return cart.map((item) => item._id === product._id
      ? { ...item, cantidad: Math.min(item.cantidad + 1, stock) }
      : item)
  }

  return [...cart, { ...product, cantidad: 1, estado: 'pendiente' }]
}

export const setCartQuantity = (cart, id, quantity) => cart.map((item) => {
  if (item._id !== id) return item
  const stock = Number(item.stock) || 1
  const safeQuantity = Math.max(1, Math.min(Number(quantity) || 1, stock))
  return { ...item, cantidad: safeQuantity }
})

export const getCartTotal = (cart) => cart.reduce(
  (total, item) => total + Number(item.Precio || 0) * item.cantidad,
  0,
)

export const getCartUnits = (cart) => cart.reduce((total, item) => total + item.cantidad, 0)

export const buildSalePayload = (cart, customer, status) => ({
  cliente: customer.nombre.trim(),
  nombreCliente: customer.nombre.trim(),
  email: customer.email.trim(),
  items: cart.map((item) => ({
    articuloId: item._id,
    nombre: item.Articulo,
    precio: Number(item.Precio || 0),
    cantidad: item.cantidad,
    subtotal: Number(item.Precio || 0) * item.cantidad,
    estado: item.estado || 'pendiente',
  })),
  total: getCartTotal(cart),
  estado: status,
})
