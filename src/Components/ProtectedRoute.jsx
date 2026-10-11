import { Navigate } from 'react-router'
import { useAuth } from '../Hooks/useAuth'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Verifying authentication...</p>
      </div>
    )
  }

  // If unauthenticated or no valid user ID, strictly prevent entering dashboard
  if (!user || (!user.id && !user._id)) {
    return <Navigate to="/login" replace />
  }

  // If user is banned, prevent entering dashboard
  if (user.banned) {
    return <Navigate to="/login" replace />
  }

  // If user's role is not allowed for this route, redirect away
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
