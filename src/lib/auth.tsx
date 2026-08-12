import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import type { Tokens, User } from './types'

const STORAGE_KEY = 'comunita.auth'

type AuthState = Tokens | null

export type AuthContextValue = {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  login: (tokens: Tokens) => void
  logout: () => void
}

function readStoredAuth(): AuthState {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? (JSON.parse(value) as Tokens) : null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthState>(readStoredAuth)

  const login = useCallback((tokens: Tokens) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
    setAuth(tokens)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: Boolean(auth?.access),
    accessToken: auth?.access ?? null,
    refreshToken: auth?.refresh ?? null,
    user: auth?.user ?? null,
    login,
    logout,
  }), [auth, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
