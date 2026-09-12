const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export { API_BASE_URL }

export const ARTICULOS_API_URL = `${API_BASE_URL}/api/articulos`
export const CLIENTES_API_URL = `${API_BASE_URL}/api/clientes`
export const PEDIDOS_API_URL = `${API_BASE_URL}/api/pedidos`
