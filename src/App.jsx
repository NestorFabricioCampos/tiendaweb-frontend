import { useEffect, useState } from 'react'
import './App.css'
import Inventario from './Inventario'
import Clientes from './Clientes'
import Pedidos from './Pedidos'
import Ventas from './Ventas'
import { API_BASE_URL, ARTICULOS_API_URL } from './config'
import { apiFetch, clearAccessToken, getAccessToken, getAuthUser, setAccessToken, setAuthUser } from './auth'

const API_URL = ARTICULOS_API_URL

const initialForm = {
  Articulo: '',
  ImagenArt: '',
  Detalles: '',
  Precio: '',
}

function App() {
  const [token, setToken] = useState(getAccessToken)
  const [user, setUser] = useState(getAuthUser)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [seccionActiva, setSeccionActiva] = useState('articulos')
  const [articulos, setArticulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const canAccessClientes = ['admin', 'encargado'].includes(user?.role)

  const fetchArticulos = async () => {
    try {
      const res = await apiFetch(API_URL)
      const data = await res.json()
      setArticulos(data)
    } catch (error) {
      console.error('Error al cargar artículos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchArticulos()
  }, [token])

  useEffect(() => {
    const handleAuthExpired = () => {
      clearAccessToken()
      setUser(null)
      setToken(null)
    }
    window.addEventListener('auth-expired', handleAuthExpired)
    return () => window.removeEventListener('auth-expired', handleAuthExpired)
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoginError('')
    setLoggingIn(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo iniciar sesión')
      setAccessToken(data.token)
      setAuthUser(data.user)
      setUser(data.user)
      setToken(data.token)
    } catch (error) {
      setLoginError(error.message)
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    clearAccessToken()
    setUser(null)
    setToken(null)
  }

  if (!token) {
    return (
      <main className="login-shell">
        <form className="login-card" onSubmit={handleLogin}>
          <p className="eyebrow">Store Admin</p>
          <h1>Iniciar sesión</h1>
          {loginError && <p className="login-error">{loginError}</p>}
          <label htmlFor="login-email">Correo</label>
          <input id="login-email" type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} required />
          <label htmlFor="login-password">Contraseña</label>
          <input id="login-password" type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} required />
          <button className="primary-btn" type="submit" disabled={loggingIn}>
            {loggingIn ? 'Validando...' : 'Entrar'}
          </button>
        </form>
      </main>
    )
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleImagenChange = async (e) => {
    const imagen = e.target.files?.[0]
    if (!imagen) return

    const datos = new FormData()
    datos.append('imagen', imagen)
    setSubiendoImagen(true)

    try {
      const res = await apiFetch(`${API_URL}/imagen`, {
        method: 'POST',
        body: datos,
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'No se pudo subir la imagen')
        return
      }

      setForm((prev) => ({ ...prev, ImagenArt: data.ImagenArt }))
    } catch (error) {
      console.error('Error al subir imagen:', error)
      alert('No se pudo conectar con el servidor para subir la imagen')
    } finally {
      setSubiendoImagen(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

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

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Error al guardar')
        return
      }

      setForm(initialForm)
      setEditandoId(null)
      fetchArticulos()
    } catch (error) {
      console.error('Error al guardar artículo:', error)
    }
  }

  const handleEdit = (articulo) => {
    setEditandoId(articulo._id)
    setForm({
      Articulo: articulo.Articulo,
      ImagenArt: articulo.ImagenArt,
      Detalles: articulo.Detalles,
      Precio: articulo.Precio || '',
    })
  }

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Error al eliminar')
        return
      }

      if (editandoId === id) {
        setEditandoId(null)
        setForm(initialForm)
      }

      fetchArticulos()
    } catch (error) {
      console.error('Error al eliminar artículo:', error)
    }
  }

  const articulosFiltrados = articulos.filter((articulo) =>
    articulo.Articulo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">S</span>
          <div>
            <p className="eyebrow">Panel</p>
            <h1>Store Admin</h1>
          </div>
        </div>

        <nav className="nav">
          <button 
            className={`nav-item ${seccionActiva === 'articulos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('articulos')}
          >
            Artículos
          </button>
          <button 
            className={`nav-item ${seccionActiva === 'inventario' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('inventario')}
          >
            Inventario
          </button>
          <button 
            className={`nav-item ${seccionActiva === 'pedidos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('pedidos')}
          >
            Pedidos
          </button>
          <button 
            className={`nav-item ${seccionActiva === 'ventas' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('ventas')}
          >
            Ventas
          </button>
          {canAccessClientes && (
            <button 
              className={`nav-item ${seccionActiva === 'clientes' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('clientes')}
            >
              Clientes
            </button>
          )}
        </nav>
        <p className="user-role">Sesión: {user?.role || 'admin'}</p>
        <button className="nav-item logout-btn" onClick={handleLogout}>Cerrar sesión</button>
      </aside>

      <main className="content">
        {seccionActiva === 'articulos' ? (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">Administración</p>
                <h2>Catálogo de calzado</h2>
              </div>
              <button className="primary-btn" onClick={() => {
                setEditandoId(null)
                setForm(initialForm)
              }}>
                + Nuevo artículo
              </button>
            </header>

            <section className="form-card">
              <h3>{editandoId ? 'Editar artículo' : 'Agregar artículo'}</h3>
              <form onSubmit={handleSubmit} className="articulo-form">
                <div className="field-group">
                  <label htmlFor="Articulo">Artículo</label>
                  <input
                    id="Articulo"
                    name="Articulo"
                    type="text"
                    value={form.Articulo}
                    onChange={handleChange}
                    placeholder="Nike Air Max"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="ImagenArt">Imagen</label>
                  <input
                    id="imagenArchivo"
                    type="file"
                    accept="image/*"
                    onChange={handleImagenChange}
                    disabled={subiendoImagen}
                  />
                  <input
                    id="ImagenArt"
                    name="ImagenArt"
                    type="text"
                    value={form.ImagenArt}
                    onChange={handleChange}
                    placeholder="URL de Cloudinary o imagen externa"
                  />
                  {subiendoImagen && <small>Subiendo imagen a Cloudinary...</small>}
                  {form.ImagenArt && (
                    <img
                      src={form.ImagenArt}
                      alt="Vista previa del artículo"
                      className="form-image-preview"
                    />
                  )}
                </div>

                <div className="field-group">
                  <label htmlFor="Precio">Precio</label>
                  <input
                    id="Precio"
                    name="Precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.Precio}
                    onChange={handleChange}
                    placeholder="99.99"
                  />
                </div>

                <div className="field-group full">
                  <label htmlFor="Detalles">Detalles</label>
                  <textarea
                    id="Detalles"
                    name="Detalles"
                    value={form.Detalles}
                    onChange={handleChange}
                    placeholder="Descripción del producto"
                  />
                </div>

                <button type="submit" className="submit-btn">
                  {editandoId ? 'Actualizar artículo' : 'Guardar artículo'}
                </button>
              </form>
            </section>

            <section className="grid-section">
              <div className="section-header">
                <h3>Artículos registrados</h3>
                <span>{articulosFiltrados.length} total</span>
              </div>

              <div className="search-box">
                <input
                  type="text"
                  placeholder="Buscar por artículo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              {loading ? (
                <p>Cargando artículos...</p>
              ) : articulosFiltrados.length === 0 ? (
                <p className="empty-state">No hay artículos registrados.</p>
              ) : (
                <div className="articulos-grid">
                  {articulosFiltrados.map((articulo) => (
                    <article key={articulo._id} className="articulo-card">
                      <img src={articulo.ImagenArt} alt={articulo.Articulo} />
                      <div className="card-body">
                        <h4>{articulo.Articulo}</h4>
                        <p>{articulo.Detalles}</p>
                        {articulo.Precio && articulo.Precio > 0 && (
                          <p className="precio-card">
                            <strong>${parseFloat(articulo.Precio).toFixed(2)}</strong>
                          </p>
                        )}
                        <div className="actions">
                          <button onClick={() => handleEdit(articulo)} className="edit-btn">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(articulo._id)} className="delete-btn">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : seccionActiva === 'inventario' ? (
          <Inventario />
        ) : seccionActiva === 'pedidos' ? (
          <Pedidos />
        ) : seccionActiva === 'ventas' ? (
          <Ventas />
        ) : seccionActiva === 'clientes' && canAccessClientes ? (
          <Clientes />
        ) : null}
      </main>
    </div>
  )
}

export default App
