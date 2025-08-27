import { useState, useEffect, createContext, useContext } from 'react'
import { AuthState, User } from '../types'
import { getAuthState, setAuthState, logout as authLogout } from '../services/authService'

interface AuthContextType extends AuthState {
  login: (user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useAuthState = () => {
  const [authState, setAuthStateLocal] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  })

  useEffect(() => {
    const storedState = getAuthState();
    setAuthStateLocal({ ...storedState, isLoading: false });

    const handleStorageChange = () => {
      setAuthStateLocal({ ...getAuthState(), isLoading: false })
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = (user: User) => {
    const newState = { isAuthenticated: true, user, isLoading: false }
    setAuthState(newState)
    setAuthStateLocal(newState)
  }

  const logout = () => {
    authLogout()
    const newState = { isAuthenticated: false, user: null, isLoading: false }
    setAuthStateLocal(newState)
  }

  const updateUser = (user: User) => {
    const newState = { ...authState, user }
    setAuthState(newState)
    setAuthStateLocal(newState)
  }

  return {
    ...authState,
    login,
    logout,
    updateUser
  }
}

export { AuthContext }
