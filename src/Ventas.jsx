import { useEffect, useState } from 'react'
import './Ventas.css'
import { ARTICULOS_API_URL, PEDIDOS_API_URL } from './config'
import { apiFetch } from './auth'

const initialCliente = {
  nombre: '',
  email: '',
}

function Ventas() {
  const [articulos, setArticulos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [cliente, setCliente] = useState(initialCliente)
  const [estadoPedido, setEstadoPedido] = useState('pendiente')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const fetchArticulos = async () => {
    setError('')
    try {
      const res = await apiFetch(ARTICULOS_API_URL)
      if (!res.ok) throw new Error('No se pudieron cargar los artículos')
      const data = await res.json()
      setArticulos(Array.isArray(data) ? data : [])
    } catch (requestError) {
      console.error('Error al cargar artículos para venta:', requestError)
      setError('No se pudo cargar el catálogo. Comprueba la conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticulos()
  }, [])

  const agregarAlCarrito = (articulo) => {
    const stockDisponible = Number(articulo.stock || 0)
    if (stockDisponible < 1) return

    setCarrito((actual) => {
      const existente = actual.find((item) => item._id === articulo._id)
      if (existente) {
        return actual.map((item) => item._id === articulo._id
          ? { ...item, cantidad: Math.min(item.cantidad + 1, stockDisponible) }
          : item)
      }
      return [...actual, { ...articulo, cantidad: 1, estado: 'pendiente' }]
    })
  }

  const cambiarCantidad = (id, cantidad) => {
    setCarrito((actual) => actual.map((item) => {
      if (item._id !== id) return item
      const cantidadSegura = Math.max(1, Math.min(Number(cantidad) || 1, Number(item.stock || 1)))
      return { ...item, cantidad: cantidadSegura }
    }))
  }

  const cambiarEstadoPedido = (estado) => {
    setEstadoPedido(estado)
    setCarrito((actual) => actual.map((item) => ({ ...item, estado })))
  }

  const quitarDelCarrito = (id) => {
    setCarrito((actual) => actual.filter((item) => item._id !== id))
  }

  const total = carrito.reduce((suma, item) => suma + Number(item.Precio || 0) * item.cantidad, 0)
  const unidades = carrito.reduce((suma, item) => suma + item.cantidad, 0)
  const articulosFiltrados = articulos.filter((articulo) =>
    articulo.Articulo.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleClienteChange = (event) => {
    const { name, value } = event.target
    setCliente((actual) => ({ ...actual, [name]: value }))
  }

  const confirmarVenta = async (event) => {
    event.preventDefault()
    setMensaje('')
    setError('')

    if (carrito.length === 0) {
      setError('Agrega al menos un artículo al carrito.')
      return
    }

    setGuardando(true)
    try {
      const res = await apiFetch(PEDIDOS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: cliente.nombre.trim(),
          nombreCliente: cliente.nombre.trim(),
          email: cliente.email.trim(),
          items: carrito.map((item) => ({
            articuloId: item._id,
            nombre: item.Articulo,
            precio: Number(item.Precio || 0),
            cantidad: item.cantidad,
            subtotal: Number(item.Precio || 0) * item.cantidad,
            estado: item.estado || 'pendiente',
          })),
          total,
          estado: estadoPedido,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo registrar la venta')

      setMensaje(`Venta registrada correctamente: pedido #${data.numero}`)
      setCarrito([])
      setCliente(initialCliente)
      setEstadoPedido('pendiente')
      fetchArticulos()
    } catch (requestError) {
      console.error('Error al registrar venta:', requestError)
      setError(requestError.message || 'No se pudo registrar la venta.')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <div className="ventas-loading">Cargando catálogo...</div>

  return (
    <div className="ventas-container">
      <header className="ventas-header">
        <div>
          <p className="eyebrow">Operación</p>
          <h2>Nueva venta</h2>
        </div>
        <span className="ventas-counter">{unidades} {unidades === 1 ? 'unidad' : 'unidades'} en carrito</span>
      </header>

      {mensaje && <p className="ventas-message ventas-message-success">{mensaje}</p>}
      {error && <p className="ventas-message ventas-message-error">{error}</p>}

      <div className="ventas-layout">
        <section className="ventas-catalogo">
          <div className="ventas-toolbar">
            <h3>Catálogo disponible</h3>
            <input
              type="search"
              placeholder="Buscar artículo..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>

          {articulosFiltrados.length === 0 ? (
            <p className="ventas-empty">No hay artículos que coincidan con la búsqueda.</p>
          ) : (
            <div className="ventas-productos">
              {articulosFiltrados.map((articulo) => {
                const stock = Number(articulo.stock || 0)
                return (
                  <article className="ventas-producto" key={articulo._id}>
                    {articulo.ImagenArt ? (
                      <img src={articulo.ImagenArt} alt={articulo.Articulo} />
                    ) : (
                      <div className="ventas-producto-placeholder">Sin imagen</div>
                    )}
                    <div className="ventas-producto-info">
                      <h4>{articulo.Articulo}</h4>
                      <span className="ventas-stock">{stock > 0 ? `${stock} disponibles` : 'Sin stock'}</span>
                      <strong>${Number(articulo.Precio || 0).toFixed(2)}</strong>
                      <button
                        type="button"
                        className="ventas-add-btn"
                        disabled={stock === 0}
                        onClick={() => agregarAlCarrito(articulo)}
                      >
                        + Agregar
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <aside className="ventas-carrito">
          <div className="ventas-carrito-header">
            <h3>Carrito</h3>
            <span>{carrito.length} artículos</span>
          </div>

          {carrito.length === 0 ? (
            <p className="ventas-empty ventas-cart-empty">El carrito está vacío.</p>
          ) : (
            <div className="ventas-carrito-items">
              {carrito.map((item) => (
                <div className="ventas-cart-item" key={item._id}>
                  <div>
                    <strong>{item.Articulo}</strong>
                    <span>${Number(item.Precio || 0).toFixed(2)} c/u</span>
                  </div>
                  <div className="ventas-cart-controls">
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.cantidad}
                      aria-label={`Cantidad de ${item.Articulo}`}
                      onChange={(event) => cambiarCantidad(item._id, event.target.value)}
                    />                    
                    <button type="button" onClick={() => quitarDelCarrito(item._id)} aria-label={`Quitar ${item.Articulo}`}>
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="ventas-total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>

          <form className="ventas-form" onSubmit={confirmarVenta}>
            <label htmlFor="venta-nombre">Cliente</label>
            <input
              id="venta-nombre"
              name="nombre"
              type="text"
              placeholder="Nombre del cliente"
              value={cliente.nombre}
              onChange={handleClienteChange}
              required
            />
            <label htmlFor="venta-email">Correo</label>
            <input
              id="venta-email"
              name="email"
              type="email"
              placeholder="cliente@correo.com"
              value={cliente.email}
              onChange={handleClienteChange}
              required
            />
            <label htmlFor="estado-pedido">Estado Pedido</label>
            <select
              id="estado-pedido"
              value={estadoPedido}
              onChange={(event) => cambiarEstadoPedido(event.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="entregado">Entregado</option>
            </select>
            <button className="ventas-submit-btn" type="submit" disabled={guardando || carrito.length === 0}>
              {guardando ? 'Registrando...' : 'Confirmar venta'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  )
}

export default Ventas
