import { Navigate } from 'react-router'
import { useAuth } from '../Hooks/useAuth'

export default function DashboardRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Verifying access...</p>
      </div>
    )
  }

  if (!user || (!user.id && !user._id) || user.banned) {
    return <Navigate to="/login" replace />
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />
    case 'transportation-manager':
      return <Navigate to="/manager" replace />
    case 'driver':
      return <Navigate to="/driver" replace />
    default:
      return <Navigate to="/passenger" replace />
  }
}
