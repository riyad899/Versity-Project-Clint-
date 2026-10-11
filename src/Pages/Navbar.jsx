import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../Hooks/useAuth'
import toast from 'react-hot-toast'
import { Bus } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!')
    navigate('/')
  }

  const getDashboardPath = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'transportation-manager':
        return '/manager'
      case 'driver':
        return '/driver'
      default:
        return '/passenger'
    }
  }

  const getRoleBadge = () => {
    if (!user) return null
    const labels = {
      admin: 'Admin',
      driver: 'Driver',
      'transportation-manager': 'Manager',
      user: 'Passenger',
    }
    return labels[user.role] || user.role
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <Bus size={22} />
        <span>Versity</span>
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/" end>
          Home
        </NavLink>
        {user ? (
          <>
            <NavLink to={getDashboardPath()}>Dashboard</NavLink>
            <span className="nav-badge">{getRoleBadge()}</span>
            <span className="nav-user-name">{user.name}</span>
            <button className="nav-login" onClick={handleLogout} type="button">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link className="nav-login-outline" to="/signup">
              Sign up
            </Link>
            <Link className="nav-login" to="/login">
              Log in
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}