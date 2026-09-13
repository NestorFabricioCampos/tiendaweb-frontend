import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, clearAccessToken, readResponse, setAccessToken } from '../src/auth'

const createStorage = () => {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

const sessionStorage = createStorage()
globalThis.window = {
  sessionStorage,
  dispatchEvent: vi.fn(),
}

describe('respuestas HTTP y autenticacion', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    clearAccessToken()
  })

  it('lee JSON solo cuando la respuesta declara contenido JSON', async () => {
    const jsonResponse = new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    })
    const textResponse = new Response('<html>error</html>', {
      headers: { 'content-type': 'text/html' },
    })

    await expect(readResponse(jsonResponse)).resolves.toEqual({ ok: true })
    await expect(readResponse(textResponse)).resolves.toBeNull()
  })

  it('devuelve null para JSON mal formado en lugar de romper la interfaz', async () => {
    const response = new Response('{bad json', {
      headers: { 'content-type': 'application/json' },
    })

    await expect(readResponse(response)).resolves.toBeNull()
  })

  it('añade el token y dispara expiracion ante una respuesta 401', async () => {
    window.dispatchEvent = vi.fn()
    setAccessToken('token-simulado')
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 401 }))

    const response = await apiFetch('https://api.example.test/articulos')
    const [, options] = globalThis.fetch.mock.calls[0]

    expect(response.status).toBe(401)
    expect(options.headers.get('Authorization')).toBe('Bearer token-simulado')
    expect(window.dispatchEvent).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem('tiendaweb_access_token')).toBeNull()
  })
})
