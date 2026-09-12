import { useEffect, useState } from 'react'
import './Empleados.css'
import { EMPLEADOS_API_URL as API_URL } from './config'
import { apiFetch } from './auth'

const initialForm = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  categoria: 'Vendedor',
  activo: true,
  password: '',
}

const obtenerCategoria = (empleado) => empleado.categoria || empleado.rol || 'Vendedor'

function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [form, setForm] = useState(initialForm)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const fetchEmpleados = async () => {
    setError('')
    try {
      const res = await apiFetch(API_URL)
      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await res.json() : null
      if (!res.ok) throw new Error(data?.message || `No se pudo cargar la lista de empleados (${res.status})`)
      if (!data) throw new Error('El servidor de empleados no devolvió una respuesta JSON')
      setEmpleados(Array.isArray(data) ? data : data.empleados || [])
    } catch (requestError) {
      console.error('Error al cargar empleados:', requestError)
      setError(requestError.message || 'No se pudieron cargar los empleados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpleados()
  }, [])

  const resetFormulario = () => {
    setForm(initialForm)
    setEditandoId(null)
    setMostrarFormulario(false)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setGuardando(true)

    const datos = { ...form, activo: form.activo === true || form.activo === 'true' }
    if (editandoId && !datos.password) delete datos.password

    try {
      const res = await apiFetch(editandoId ? `${API_URL}/${editandoId}` : API_URL, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo guardar el empleado')

      setMensaje(editandoId ? 'Empleado actualizado correctamente' : 'Empleado agregado correctamente')
      setTimeout(() => setMensaje(''), 3000)
      resetFormulario()
      fetchEmpleados()
    } catch (requestError) {
      setError(requestError.message || 'No se pudo guardar el empleado')
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (empleado) => {
    setEditandoId(empleado._id)
    setForm({
      nombre: empleado.nombre || '',
      apellido: empleado.apellido || '',
      email: empleado.email || '',
      telefono: empleado.telefono || '',
      categoria: obtenerCategoria(empleado),
      activo: empleado.activo !== false,
      password: '',
    })
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) return

    try {
      const res = await apiFetch(`${API_URL}/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo eliminar el empleado')
      setMensaje('Empleado eliminado correctamente')
      setTimeout(() => setMensaje(''), 3000)
      fetchEmpleados()
    } catch (requestError) {
      setError(requestError.message || 'No se pudo eliminar el empleado')
    }
  }

  const empleadosFiltrados = empleados.filter((empleado) => {
    const texto = `${empleado.nombre || ''} ${empleado.apellido || ''} ${empleado.email || ''} ${obtenerCategoria(empleado)}`.toLowerCase()
    const coincideBusqueda = texto.includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === 'todos' || (filtroEstado === 'activo' ? empleado.activo !== false : empleado.activo === false)
    return coincideBusqueda && coincideEstado
  })

  if (loading) return <div className="empleados-loading">Cargando empleados...</div>

  return (
    <div className="empleados-container">
      <header className="empleados-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h2>Gestión de empleados</h2>
          <p className="empleados-subtitle">Administra encargados y vendedores de la tienda.</p>
        </div>
        <div className="empleados-header-actions">
          <button className="empleados-refresh-btn" onClick={fetchEmpleados}>↻ Actualizar</button>
          <button className="empleados-primary-btn" onClick={() => { resetFormulario(); setMostrarFormulario(true) }}>
            + Nuevo empleado
          </button>
        </div>
      </header>

      {mensaje && <p className="empleados-message empleados-message-success">{mensaje}</p>}
      {error && <p className="empleados-message empleados-message-error">{error}</p>}

      {mostrarFormulario && (
        <section className="empleados-form-card">
          <div className="empleados-form-header">
            <h3>{editandoId ? 'Modificar empleado' : 'Alta de empleado'}</h3>
            <button type="button" className="empleados-close-btn" onClick={resetFormulario} aria-label="Cerrar formulario">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="empleados-form">
            <label>Nombre<input name="nombre" value={form.nombre} onChange={handleChange} required /></label>
            <label>Apellido<input name="apellido" value={form.apellido} onChange={handleChange} required /></label>
            <label>Correo electrónico<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
            <label>Teléfono<input name="telefono" value={form.telefono} onChange={handleChange} required /></label>
            <label>Categoría<select name="categoria" value={form.categoria} onChange={handleChange}><option>Encargado</option><option>Vendedor</option></select></label>
            <label>Estado<select name="activo" value={form.activo ? 'true' : 'false'} onChange={handleChange}><option value="true">Activo</option><option value="false">Inactivo</option></select></label>
            <label className="empleados-password-field">{editandoId ? 'Nueva contraseña (opcional)' : 'Contraseña'}<input name="password" type="password" value={form.password} onChange={handleChange} required={!editandoId} minLength="6" /></label>
            <div className="empleados-form-actions">
              <button type="submit" className="empleados-primary-btn" disabled={guardando}>{guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Registrar empleado'}</button>
              <button type="button" className="empleados-cancel-btn" onClick={resetFormulario}>Cancelar</button>
            </div>
          </form>
        </section>
      )}

      <section className="empleados-toolbar">
        <input type="search" placeholder="Buscar por nombre, correo o categoría..." value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
        <select value={filtroEstado} onChange={(event) => setFiltroEstado(event.target.value)} aria-label="Filtrar por estado">
          <option value="todos">Todos los estados</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option>
        </select>
      </section>

      <section className="empleados-table-card">
        {empleadosFiltrados.length === 0 ? <p className="empleados-empty">No hay empleados que coincidan con los filtros.</p> : (
          <div className="empleados-table-wrapper">
            <table className="empleados-table">
              <thead><tr><th>Empleado</th><th>Correo</th><th>Teléfono</th><th>Categoría</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>{empleadosFiltrados.map((empleado) => (
                <tr key={empleado._id} className={empleado.activo === false ? 'empleado-inactivo' : ''}>
                  <td data-label="Empleado"><strong>{empleado.nombre} {empleado.apellido}</strong></td><td data-label="Correo">{empleado.email}</td><td data-label="Teléfono">{empleado.telefono || 'Sin teléfono'}</td>
                  <td data-label="Categoría"><span className={`empleado-category empleado-category-${obtenerCategoria(empleado).toLowerCase()}`}>{obtenerCategoria(empleado)}</span></td>
                  <td data-label="Estado"><span className={`empleado-status ${empleado.activo === false ? 'empleado-status-inactivo' : ''}`}>{empleado.activo === false ? 'Inactivo' : 'Activo'}</span></td>
                  <td data-label="Acciones" className="empleado-actions"><button type="button" onClick={() => handleEditar(empleado)}>Modificar</button><button type="button" className="empleado-delete-btn" onClick={() => handleEliminar(empleado._id)}>Dar de baja</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
      <p className="empleados-footer">Mostrando {empleadosFiltrados.length} de {empleados.length} empleados</p>
    </div>
  )
}

export default Empleados