const API_BASE_URL = (import.meta.env.NestorFabricioCampos/tiendaweb-backend || 'http://localhost:3000').replace(/\/+$/, '')

export { API_BASE_URL }

export const ARTICULOS_API_URL = `${API_BASE_URL}/api/articulos`
export const CLIENTES_API_URL = `${API_BASE_URL}/api/clientes`
export const PEDIDOS_API_URL = `${API_BASE_URL}/api/pedidos`
export const EMPLEADOS_API_URL = `${API_BASE_URL}/api/empleados`
