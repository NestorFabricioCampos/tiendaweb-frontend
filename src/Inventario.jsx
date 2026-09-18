import { useEffect, useState } from 'react'
import './Inventario.css'
import { ARTICULOS_API_URL as API_URL } from './config'
import { apiFetch, readResponse } from './auth'
import { filterInventory, getStockStatus } from './domain'

function Inventario() {
  const [inventario, setInventario] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroStock, setFiltroStock] = useState('todos')
  const [editandoId, setEditandoId] = useState(null)
  const [cantidadEdit, setCantidadEdit] = useState('')
  const [precioEdit, setPrecioEdit] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')

  const fetchInventario = async () => {
    try {
      const res = await apiFetch(API_URL)
      if (!res.ok) throw new Error('No se pudo cargar el inventario')
      const data = await readResponse(res)
      setInventario(Array.isArray(data) ? data : data?.articulos || [])
    } catch (error) {
      console.error('Error al cargar inventario:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventario()
  }, [])

  const getEstadoStock = (cantidad) => {
    return getStockStatus(cantidad)
  }

  const getEtiquetaStock = (cantidad) => {
    if (cantidad === 0) return 'Sin stock'
    if (cantidad < 5) return 'Bajo stock'
    if (cantidad < 10) return 'Stock medio'
    return 'Stock disponible'
  }

  const filtrarInventario = () => {
    return filterInventory(inventario, busqueda, filtroStock)
  }

  const handleEditar = (articulo) => {
    setEditandoId(articulo._id)
    setCantidadEdit(articulo.stock || 0)
    setPrecioEdit(articulo.Precio || 0)
  }

  const handleActualizar = async (id) => {
    try {
      const res = await apiFetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock: parseInt(cantidadEdit),
          Precio: parseFloat(precioEdit),
        }),
      })

      if (!res.ok) {
        alert('Error al actualizar el inventario')
        return
      }

      setMensajeExito('✓ Inventario actualizado correctamente')
      setTimeout(() => setMensajeExito(''), 3000)
      setEditandoId(null)
      fetchInventario()
    } catch (error) {
      console.error('Error al actualizar:', error)
      alert('Error al actualizar el inventario')
    }
  }

  const handleCancelar = () => {
    setEditandoId(null)
    setCantidadEdit('')
    setPrecioEdit('')
  }

  const handleAjustarCantidad = async (id, cambio) => {
    const articulo = inventario.find((a) => a._id === id)
    const nuevaCantidad = Math.max(0, (articulo.stock || 0) + cambio)

    try {
      const res = await apiFetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock: nuevaCantidad,
        }),
      })

      if (!res.ok) {
        alert('Error al ajustar cantidad')
        return
      }

      fetchInventario()
    } catch (error) {
      console.error('Error al ajustar cantidad:', error)
    }
  }

  const inventarioFiltrado = filtrarInventario()
  const totalArticulos = inventario.length
  const totalStock = inventario.reduce((sum, item) => sum + (item.stock || 0), 0)
  const articulosSinStock = inventario.filter((item) => item.stock === 0).length

  if (loading) {
    return <div className="loading">Cargando inventario...</div>
  }

  return (
    <div className="inventario-container">
      <div className="inventario-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h2>Inventario de productos</h2>
        </div>
        <button className="refresh-btn" onClick={fetchInventario}>
          ↻ Actualizar
        </button>
      </div>

      {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Total de artículos</span>
            <span className="stat-value">{totalArticulos}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-label">Unidades en stock</span>
            <span className="stat-value">{totalStock}</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <span className="stat-label">Sin stock</span>
            <span className="stat-value">{articulosSinStock}</span>
          </div>
        </div>
      </div>

      <div className="filtros-seccion">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="filtro-stock">
          <label htmlFor="filtro">Filtrar por estado:</label>
          <select
            id="filtro"
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="disponible">Stock disponible (≥5)</option>
            <option value="medio-stock">Stock medio (3-9)</option>
            <option value="bajo-stock">Bajo stock (1-4)</option>
            <option value="sin-stock">Sin stock (0)</option>
          </select>
        </div>
      </div>

      <div className="tabla-contenedor">
        {inventarioFiltrado.length === 0 ? (
          <div className="sin-resultados">
            <p>No hay artículos que coincidan con los filtros</p>
          </div>
        ) : (
          <table className="inventario-tabla">
            <thead>
              <tr>
                <th>Artículo</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.map((articulo) => (
                <tr key={articulo._id} className={`row-${getEstadoStock(articulo.stock || 0)}`}>
                  <td className="nombre-articulo">
                    <div className="articulo-info">
                      {articulo.ImagenArt && (
                        <img
                          src={articulo.ImagenArt}
                          alt={articulo.Articulo}
                          className="articulo-imagen"
                        />
                      )}
                      <div>
                        <p className="articulo-nombre">{articulo.Articulo}</p>
                        {articulo.Detalles && (
                          <p className="articulo-detalles">{articulo.Detalles.substring(0, 50)}...</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {editandoId === articulo._id ? (
                    <td className="cantidad-edit">
                      <input
                        type="number"
                        min="0"
                        value={cantidadEdit}
                        onChange={(e) => setCantidadEdit(e.target.value)}
                        className="input-cantidad"
                      />
                    </td>
                  ) : (
                    <td className="cantidad-celda">
                      <span className="cantidad-valor">{articulo.stock || 0}</span>
                    </td>
                  )}

                  <td>
                    <span className={`badge ${getEstadoStock(articulo.stock || 0)}`}>
                      {getEtiquetaStock(articulo.stock || 0)}
                    </span>
                  </td>

                  {editandoId === articulo._id ? (
                    <td className="precio-edit">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={precioEdit}
                        onChange={(e) => setPrecioEdit(e.target.value)}
                        className="input-precio"
                      />
                    </td>
                  ) : (
                    <td className="precio-celda">
                      ${parseFloat(articulo.Precio || 0).toFixed(2)}
                    </td>
                  )}

                  <td className="acciones-celda">
                    {editandoId === articulo._id ? (
                      <div className="acciones-grupo">
                        <button
                          className="btn-guardar"
                          onClick={() => handleActualizar(articulo._id)}
                        >
                          ✓ Guardar
                        </button>
                        <button className="btn-cancelar" onClick={handleCancelar}>
                          ✕ Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="acciones-grupo">
                        <button
                          className="btn-menos"
                          onClick={() => handleAjustarCantidad(articulo._id, -1)}
                          title="Restar 1"
                        >
                          −
                        </button>
                        <button
                          className="btn-editar"
                          onClick={() => handleEditar(articulo)}
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          className="btn-mas"
                          onClick={() => handleAjustarCantidad(articulo._id, 1)}
                          title="Sumar 1"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="inventario-footer">
        <p>
          Mostrando <strong>{inventarioFiltrado.length}</strong> de{' '}
          <strong>{totalArticulos}</strong> artículos
        </p>
      </div>
    </div>
  )
}

export default Inventario
