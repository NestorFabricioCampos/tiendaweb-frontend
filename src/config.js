// Limpia barras finales y remueve '/api' si viene incluido en la variable de entorno
const rawUrl = (import.meta.env.VITE_API_URL || 'https://tiendaweb-backend.onrender.com').replace(/\/+$/, '');
export const API_BASE_URL = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl;

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://tiendaweb-backend.onrender.com' || 'http://localhost:3000').replace(/\/+$/, '')

export { API_BASE_URL }

export const ARTICULOS_API_URL = `${API_BASE_URL}/api/articulos`
export const CLIENTES_API_URL = `${API_BASE_URL}/api/clientes`
export const PEDIDOS_API_URL = `${API_BASE_URL}/api/pedidos`
export const EMPLEADOS_API_URL = `${API_BASE_URL}/api/empleados`
