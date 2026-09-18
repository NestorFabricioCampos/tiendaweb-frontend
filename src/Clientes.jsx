import { useEffect, useState } from 'react'
import './Clientes.css'
import { CLIENTES_API_URL as API_URL } from './config'
import { apiFetch, readResponse } from './auth'

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    documento: '',
    fechaNacimiento: '',
    activo: true,
  })

  const fetchClientes = async () => {
    try {
      const res = await apiFetch(API_URL)
      const data = await readResponse(res)
      if (!res.ok) throw new Error(data?.message || 'No se pudieron cargar los clientes')
      setClientes(Array.isArray(data) ? data : data?.clientes || [])
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nombre || !form.apellido || !form.email || !form.telefono || !form.documento) {
      alert('Por favor completa los campos requeridos')
      return
    }

    const method = editandoId ? 'PUT' : 'POST'
    const url = editandoId ? `${API_URL}/${editandoId}` : API_URL

    try {
      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await readResponse(res)

      if (!res.ok) {
        alert(data?.message || 'Error al guardar')
        return
      }

      setMensajeExito(
        editandoId ? '✓ Cliente actualizado correctamente' : '✓ Cliente agregado correctamente'
      )
      setTimeout(() => setMensajeExito(''), 3000)
      resetFormulario()
      fetchClientes()
    } catch (error) {
      console.error('Error al guardar cliente:', error)
      alert('Error al guardar el cliente')
    }
  }

  const resetFormulario = () => {
    setForm({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      documento: '',
      fechaNacimiento: '',
      activo: true,
    })
    setEditandoId(null)
    setMostrarFormulario(false)
  }

  const handleEditar = (cliente) => {
    setEditandoId(cliente._id)
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion || '',
      ciudad: cliente.ciudad || '',
      documento: cliente.documento || '',
      fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.split('T')[0] : '',
      activo: cliente.activo !== undefined ? cliente.activo : true,
    })
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return
    }

    try {
      const res = await apiFetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      const data = await readResponse(res)

      if (!res.ok) {
        alert(data?.message || 'Error al eliminar')
        return
      }

      setMensajeExito('✓ Cliente eliminado correctamente')
      setTimeout(() => setMensajeExito(''), 3000)
      fetchClientes()
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
      alert('Error al eliminar el cliente')
    }
  }

  const filtrarClientes = () => {
    return clientes.filter((cliente) => {
      const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
      const coincideNombre = nombreCompleto.includes(busqueda.toLowerCase())
      const coincideEmail = cliente.email.toLowerCase().includes(busqueda.toLowerCase())
      const coincideTelefono = cliente.telefono.includes(busqueda)
      const coincideDocumento = cliente.documento.includes(busqueda)

      const cumpleFiltro =
        filtroEstado === 'todos' || (filtroEstado === 'activo' ? cliente.activo : !cliente.activo)

      return (coincideNombre || coincideEmail || coincideTelefono || coincideDocumento) && cumpleFiltro
    })
  }

  const clientesFiltrados = filtrarClientes()
  const totalClientes = clientes.length
  const clientesActivos = clientes.filter((c) => c.activo).length
  const clientesInactivos = clientes.filter((c) => !c.activo).length

  if (loading) {
    return <div className="loading">Cargando clientes...</div>
  }

  return (
    <div className="clientes-container">
      <div className="clientes-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h2>Gestión de clientes</h2>
        </div>
        <div className="header-buttons">
          <button className="refresh-btn" onClick={fetchClientes}>
            ↻ Actualizar
          </button>
          <button 
            className="agregar-btn"
            onClick={() => {
              resetFormulario()
              setMostrarFormulario(true)
            }}
          >
            + Agregar Cliente
          </button>
        </div>
      </div>

      {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Total de clientes</span>
            <span className="stat-value">{totalClientes}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <span className="stat-label">Clientes activos</span>
            <span className="stat-value">{clientesActivos}</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⊘</div>
          <div className="stat-info">
            <span className="stat-label">Clientes inactivos</span>
            <span className="stat-value">{clientesInactivos}</span>
          </div>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="formulario-card">
          <div className="formulario-header">
            <h3>{editandoId ? 'Editar cliente' : 'Agregar nuevo cliente'}</h3>
            <button className="close-btn" onClick={resetFormulario}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="cliente-form">
            <div className="form-row">
              <div className="field-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Juan"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="apellido">Apellido *</label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Pérez"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="documento">Documento *</label>
                <input
                  id="documento"
                  name="documento"
                  type="text"
                  value={form.documento}
                  onChange={handleChange}
                  placeholder="12345678A"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@example.com"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="+34 612 345 678"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                <input
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label htmlFor="direccion">Dirección</label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Calle Principal 123"
                />
              </div>

              <div className="field-group">
                <label htmlFor="ciudad">Ciudad</label>
                <input
                  id="ciudad"
                  name="ciudad"
                  type="text"
                  value={form.ciudad}
                  onChange={handleChange}
                  placeholder="Madrid"
                />
              </div>

              <div className="field-group">
                <label htmlFor="activo">Estado</label>
                <select
                  id="activo"
                  name="activo"
                  value={form.activo ? 'true' : 'false'}
                  onChange={(e) => handleChange({ 
                    target: { name: 'activo', value: e.target.value === 'true' } 
                  })}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editandoId ? 'Actualizar cliente' : 'Guardar cliente'}
              </button>
              <button type="button" className="cancel-btn" onClick={resetFormulario}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filtros-seccion">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, email, teléfono o documento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="filtro-estado">
          <label htmlFor="filtro">Filtrar por estado:</label>
          <select
            id="filtro"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="tabla-contenedor">
        {clientesFiltrados.length === 0 ? (
          <div className="sin-resultados">
            <p>No hay clientes que coincidan con los filtros</p>
          </div>
        ) : (
          <table className="clientes-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr 
                  key={cliente._id} 
                  className={`row-${cliente.activo ? 'activo' : 'inactivo'}`}
                >
                  <td className="nombre-cliente" data-label="Nombre">
                    <div className="avatar">{cliente.nombre.charAt(0)}</div>
                    <div>
                      <p className="cliente-nombre">{cliente.nombre} {cliente.apellido}</p>
                      <p className="cliente-documento">{cliente.documento}</p>
                    </div>
                  </td>

                  <td className="email-cliente" data-label="Email">
                    <a href={`mailto:${cliente.email}`}>{cliente.email}</a>
                  </td>

                  <td className="telefono-cliente" data-label="Teléfono">
                    <a href={`tel:${cliente.telefono}`}>{cliente.telefono}</a>
                  </td>

                  <td className="ciudad-cliente" data-label="Ciudad">
                    {cliente.ciudad || '—'}
                  </td>

                  <td data-label="Estado">
                    <span className={`badge ${cliente.activo ? 'activo' : 'inactivo'}`}>
                      {cliente.activo ? '✓ Activo' : '⊘ Inactivo'}
                    </span>
                  </td>

                  <td className="acciones-celda" data-label="Acciones">
                    <div className="acciones-grupo">
                      <button
                        className="btn-editar"
                        onClick={() => handleEditar(cliente)}
                        title="Editar"
                      >
                        ✎ Editar
                      </button>
                      <button
                        className="btn-eliminar"
                        onClick={() => handleEliminar(cliente._id)}
                        title="Eliminar"
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="clientes-footer">
        <p>
          Mostrando <strong>{clientesFiltrados.length}</strong> de{' '}
          <strong>{totalClientes}</strong> clientes
        </p>
      </div>
    </div>
  )
}

export default Clientes
