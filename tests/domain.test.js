import { describe, expect, it } from 'vitest'
import {
  addToCart,
  buildSalePayload,
  canAccessManagement,
  filterInventory,
  filterOrders,
  getCartTotal,
  getCartUnits,
  getOrderStatus,
  getStockStatus,
  setCartQuantity,
} from '../src/domain'

const inventory = [
  { _id: 'zero', Articulo: 'Botin negro', stock: 0 },
  { _id: 'low', Articulo: 'Sandalia roja', stock: 3 },
  { _id: 'medium', Articulo: 'Zapatilla azul', stock: 7 },
  { _id: 'available', Articulo: 'Bota blanca', stock: 12 },
]

describe('reglas de inventario', () => {
  it('clasifica correctamente todos los rangos de stock', () => {
    expect(getStockStatus(0)).toBe('sin-stock')
    expect(getStockStatus(4)).toBe('bajo-stock')
    expect(getStockStatus(9)).toBe('medio-stock')
    expect(getStockStatus(10)).toBe('buen-stock')
  })

  it('filtra stock medio sin incluir stock bajo ni alto', () => {
    const result = filterInventory(inventory, '', 'medio-stock')
    expect(result.map((item) => item._id)).toEqual(['medium'])
  })

  it('combina busqueda y filtro de stock', () => {
    const result = filterInventory(inventory, 'BOTIN', 'sin-stock')
    expect(result.map((item) => item._id)).toEqual(['zero'])
  })

  it('tolera nombres ausentes y cantidades no numericas', () => {
    expect(filterInventory([{ _id: 'invalid', stock: 'x' }])).toEqual([{ _id: 'invalid', stock: 'x' }])
    expect(getStockStatus('x')).toBe('sin-stock')
  })
})

describe('reglas de permisos', () => {
  it('permite administrar a admin y encargado', () => {
    expect(canAccessManagement('admin')).toBe(true)
    expect(canAccessManagement('encargado')).toBe(true)
  })

  it('rechaza vendedores, valores desconocidos y sesiones sin rol', () => {
    expect(canAccessManagement('vendedor')).toBe(false)
    expect(canAccessManagement('')).toBe(false)
    expect(canAccessManagement(undefined)).toBe(false)
  })
})

describe('reglas de pedidos', () => {
  const orders = [
    { _id: 'pending', numero: 101, nombreCliente: 'Ana Lopez', items: [{ estado: 'pendiente' }], total: 20 },
    { _id: 'delivered', numero: 102, cliente: { nombre: 'Luis', apellido: 'Perez' }, items: [{ estado: 'entregado' }], totalPedido: '35.5' },
    { _id: 'empty', numero: 103, email: 'cliente@example.com', items: [] },
  ]

  it('considera entregado solo un pedido con items y todos entregados', () => {
    expect(getOrderStatus(orders[0])).toBe('pendiente')
    expect(getOrderStatus(orders[1])).toBe('entregado')
    expect(getOrderStatus(orders[2])).toBe('pendiente')
  })

  it('filtra por numero, cliente y estado', () => {
    expect(filterOrders(orders, '102', 'entregado')).toHaveLength(1)
    expect(filterOrders(orders, 'luis perez')).toHaveLength(1)
    expect(filterOrders(orders, '', 'pendiente')).toHaveLength(2)
  })
})

describe('reglas de carrito y venta', () => {
  const product = { _id: 'shoe-1', Articulo: 'Zapatilla', Precio: '25.50', stock: 2 }

  it('no agrega productos sin stock y limita la cantidad al stock', () => {
    expect(addToCart([], { ...product, stock: 0 })).toEqual([])
    const one = addToCart([], product)
    const two = addToCart(one, product)
    const capped = addToCart(two, product)
    expect(capped[0].cantidad).toBe(2)
  })

  it('normaliza cantidades invalidas y no supera el stock', () => {
    const cart = addToCart([], product)
    expect(setCartQuantity(cart, product._id, 99)[0].cantidad).toBe(2)
    expect(setCartQuantity(cart, product._id, 'invalid')[0].cantidad).toBe(1)
    expect(setCartQuantity(cart, product._id, 0)[0].cantidad).toBe(1)
  })

  it('calcula unidades, total y payload compatible con ventas', () => {
    const cart = setCartQuantity(addToCart([], product), product._id, 2)
    const payload = buildSalePayload(cart, { nombre: ' Ana ', email: 'ana@example.com' }, 'pendiente')
    expect(getCartUnits(cart)).toBe(2)
    expect(getCartTotal(cart)).toBe(51)
    expect(payload.cliente).toBe('Ana')
    expect(payload.total).toBe(51)
    expect(payload.items[0].subtotal).toBe(51)
    expect(payload.items[0].estado).toBe('pendiente')
  })
})
