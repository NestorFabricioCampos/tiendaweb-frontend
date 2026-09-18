import { useEffect, useState } from 'react'
import './Pedidos.css'
import { PEDIDOS_API_URL as API_URL } from './config'
import { apiFetch, readResponse } from './auth'
import { filterOrders, getOrderItems, getOrderStatus, getOrderTotal } from './domain'

const estados = ['todos', 'pendiente', 'entregado']

const obtenerNumero = (pedido) => pedido.numero || pedido.numeroPedido || pedido._id

const obtenerCliente = (pedido) => {
  if (typeof pedido.cliente === 'string') return pedido.cliente
  if (pedido.cliente) {
    return `${pedido.cliente.nombre || ''} ${pedido.cliente.apellido || ''}`.trim() || 'Cliente sin nombre'
  }
  return pedido.nombreCliente || pedido.email || 'Cliente sin nombre'
}

const obtenerTotal = getOrderTotal
const obtenerItems = getOrderItems
const obtenerEstadoPedido = getOrderStatus

function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [error, setError] = useState('')
  const [actualizandoId, setActualizandoId] = useState(null)

  const fetchPedidos = async () => {
    setError('')
    try {
      const res = await apiFetch(API_URL)
      if (!res.ok) throw new Error('No se pudieron cargar los pedidos')
      const data = await readResponse(res)
      setPedidos(Array.isArray(data) ? data : data.pedidos || [])
    } catch (requestError) {
      console.error('Error al cargar pedidos:', requestError)
      setError('No se pudieron cargar los pedidos. Comprueba la conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPedidos()
  }, [])

  const actualizarEstado = async (pedido) => {
    const estadoActual = obtenerEstadoPedido(pedido)
    const nuevoEstado = estadoActual === 'entregado' ? 'pendiente' : 'entregado'
    setActualizandoId(pedido._id)
    setError('')

    try {
      const res = await apiFetch(`${API_URL}/${pedido._id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      const data = await readResponse(res)
      if (!res.ok) throw new Error(data?.message || 'No se pudo actualizar el estado')
      setPedidos((actual) => actual.map((item) => item._id === data._id ? data : item))
    } catch (requestError) {
      console.error('Error al actualizar estado del pedido:', requestError)
      setError(requestError.message || 'No se pudo actualizar el estado del pedido')
    } finally {
      setActualizandoId(null)
    }
  }

  const pedidosFiltrados = filterOrders(pedidos, busqueda, filtroEstado)

  const totalVentas = pedidos.reduce((total, pedido) => total + obtenerTotal(pedido), 0)
  const pedidosPendientes = pedidos.filter((pedido) => obtenerEstadoPedido(pedido) === 'pendiente').length
  const pedidosEntregados = pedidos.filter((pedido) => obtenerEstadoPedido(pedido) === 'entregado').length

  if (loading) return <div className="pedidos-loading">Cargando pedidos...</div>

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h2>Gestión de pedidos</h2>
        </div>
        <button className="pedidos-refresh-btn" onClick={fetchPedidos}>
          ↻ Actualizar
        </button>
      </div>

      {error && <p className="pedidos-error">{error}</p>}

      <div className="pedidos-stats-grid">
        <div className="pedidos-stat-card">
          <span className="pedidos-stat-icon">#</span>
          <span className="pedidos-stat-label">Total de pedidos</span>
          <strong>{pedidos.length}</strong>
        </div>
        <div className="pedidos-stat-card pedidos-stat-card-warning">
          <span className="pedidos-stat-icon">!</span>
          <span className="pedidos-stat-label">Pendientes</span>
          <strong>{pedidosPendientes}</strong>
        </div>
        <div className="pedidos-stat-card pedidos-stat-card-success">
          <span className="pedidos-stat-icon">✓</span>
          <span className="pedidos-stat-label">Entregados</span>
          <strong>{pedidosEntregados}</strong>
        </div>
        <div className="pedidos-stat-card">
          <span className="pedidos-stat-icon">$</span>
          <span className="pedidos-stat-label">Ventas acumuladas</span>
          <strong>${totalVentas.toFixed(2)}</strong>
        </div>
      </div>

      <section className="pedidos-table-card">
        <div className="pedidos-toolbar">
          <input
            type="search"
            placeholder="Buscar por número o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            {estados.slice(1).map((estado) => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <p className="pedidos-empty">No hay pedidos que coincidan con los filtros.</p>
        ) : (
          <div className="pedidos-table-wrapper">
            <table className="pedidos-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((pedido) => {
                  const estado = obtenerEstadoPedido(pedido)
                  const items = obtenerItems(pedido)
                  return (
                    <tr key={pedido._id || obtenerNumero(pedido)}>
                      <td className="pedido-number" data-label="Pedido">#{obtenerNumero(pedido)}</td>
                      <td data-label="Cliente">{obtenerCliente(pedido)}</td>
                      <td data-label="Productos">
                        <div className="pedido-items">
                          {items.length === 0 ? (
                            <span>Sin detalle</span>
                          ) : items.map((item, index) => (
                            <div className="pedido-item" key={`${item.articuloId || item.nombre}-${index}`}>
                              <span>{item.nombre || item.Articulo || 'Producto'} x{item.cantidad || 1}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td data-label="Fecha">{pedido.fecha ? new Date(pedido.fecha).toLocaleDateString('es-ES') : 'Sin fecha'}</td>
                      <td data-label="Total">${obtenerTotal(pedido).toFixed(2)}</td>
                      <td data-label="Estado"><span className={`pedido-status pedido-status-${estado}`}>{estado}</span></td>
                      <td data-label="Acciones">
                        <button
                          className={`pedido-toggle-btn pedido-toggle-${estado}`}
                          disabled={actualizandoId === pedido._id}
                          onClick={() => actualizarEstado(pedido)}
                        >
                          {actualizandoId === pedido._id
                            ? 'Actualizando...'
                            : estado === 'entregado' ? 'Marcar pendiente' : 'Marcar entregado'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Pedidos
