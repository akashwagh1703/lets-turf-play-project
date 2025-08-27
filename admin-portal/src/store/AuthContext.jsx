import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const session = authService.getSession()
    if (session) setUser(session.user)
  }, [])

  const login = async (email, password) => {
    const session = await authService.login(email, password)
    setUser(session.user)
    return session
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login, logout
  }), [user])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
