import { Link, NavLink } from 'react-router'
import { useAuth } from '../Hooks/useAuth'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <Link className="brand" to="/">Northstar</Link>
      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink>
        {user ? (
          <button className="nav-login" onClick={logout} type="button">Log out</button>
        ) : (
          <Link className="nav-login" to="/login">Log in</Link>
        )}
      </nav>
    </header>
  )
}