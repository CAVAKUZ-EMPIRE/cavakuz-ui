import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api'
import { storage } from '../lib/apiClient'
import type { User } from '../types'

type AuthContextValue = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string, remember: boolean) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => storage.getUser() as User | null)
  const [loading, setLoading] = useState(Boolean(storage.getToken()))

  const refresh = useCallback(async () => {
    if (!storage.getToken()) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const nextUser = await authApi.me()
      setUser(nextUser)
      storage.setUser(nextUser, Boolean(localStorage.getItem('cavakuz-token')))
    } catch {
      storage.clear()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const result = await authApi.login(email, password)
    if (!result.token) {
      throw new Error('Login succeeded but no token was returned.')
    }
    storage.setToken(result.token, remember)
    storage.setUser(result.user, remember)
    setUser(result.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Keep local logout even if the API call fails.
    } finally {
      storage.clear()
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && storage.getToken()),
      isAdmin: user?.role === 'admin',
      login,
      logout,
      refresh,
    }),
    [user, loading, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
