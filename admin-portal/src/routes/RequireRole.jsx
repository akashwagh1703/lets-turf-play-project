import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext.jsx'

export default function RequireRole({ roles = [], children }) {
  const { user } = useAuth()
  if (!user || (roles.length && !roles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
