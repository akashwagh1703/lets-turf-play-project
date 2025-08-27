import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AnimatedLoader } from './ui/AnimatedLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <AnimatedLoader />
  }

  if (!isAuthenticated) {
    // Redirect to login with the current location as state
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
