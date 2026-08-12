import type { AuthContextValue } from './auth'

const API_URL = import.meta.env.VITE_API_URL ?? ''

function isJwtExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number }
    return !payload.exp || payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  auth?: AuthContextValue,
): Promise<T> {
  if (auth?.accessToken && isJwtExpired(auth.accessToken)) {
    auth.logout()
    window.location.assign('/login')
    throw new Error('Your session expired. Please sign in again.')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
      ...options.headers,
    },
  })

  if (response.status === 401 && auth) {
    auth.logout()
    window.location.assign('/login')
    throw new Error('Your session expired. Please sign in again.')
  }

  const body = response.status === 204 ? null : await response.json()
  if (!response.ok) {
    const detail = body?.detail ?? Object.values(body ?? {}).flat().join(' ') ?? 'Request failed'
    throw new Error(String(detail))
  }
  return body as T
}
