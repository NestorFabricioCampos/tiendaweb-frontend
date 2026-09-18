const TOKEN_KEY = 'tiendaweb_access_token'
const USER_KEY = 'tiendaweb_user'

const session = () => window.sessionStorage

export const getAccessToken = () => session().getItem(TOKEN_KEY)

export const setAccessToken = (token) => session().setItem(TOKEN_KEY, token)

export const getAuthUser = () => {
  try {
    return JSON.parse(session().getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export const setAuthUser = (user) => session().setItem(USER_KEY, JSON.stringify(user))

export const clearAccessToken = () => {
  session().removeItem(TOKEN_KEY)
  session().removeItem(USER_KEY)
}

export const readResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return null

  try {
    return await response.json()
  } catch {
    return null
  }
}

export const apiFetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {})
  const token = getAccessToken()

  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(url, { ...options, headers })
  if (response.status === 401) {
    clearAccessToken()
    window.dispatchEvent(new Event('auth-expired'))
  }
  return response
}
