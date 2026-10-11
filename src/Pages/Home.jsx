import { Link } from 'react-router'
import { useAuth } from '../Hooks/useAuth'
import { Bus, Route, UserCheck } from 'lucide-react'

function Home() {
  const { user } = useAuth()

  const getDashboardLink = () => {
    if (!user) return null
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

  return (
    <section className="home-page">
      <div className="home-copy">
        <p className="eyebrow">Campus Transportation</p>
        <h1>Smart campus transit, simplified.</h1>
        <p className="home-description">
          Manage buses, routes, and drivers across your campus with a single unified platform.
          Sign in to access your personalized dashboard.
        </p>
        <div className="home-actions">
          {user ? (
            <Link className="button button-primary" to={getDashboardLink()}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link className="button button-primary" to="/login">
                Log in
              </Link>
              <Link className="button button-secondary" to="/signup">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="home-panel" aria-label="System overview">
        <div className="panel-topline">
          <span />
          <span />
          <span />
        </div>
        <div className="panel-heading">System at a glance</div>
        <div className="metric-row">
          <strong>
            <Bus size={24} />
          </strong>
          <span>Campus Buses</span>
          <b>Managed</b>
        </div>
        <div className="metric-row">
          <strong>
            <Route size={24} />
          </strong>
          <span>Active Routes</span>
          <b>Tracked</b>
        </div>
        <div className="metric-row">
          <strong>
            <UserCheck size={24} />
          </strong>
          <span>Drivers</span>
          <b>Assigned</b>
        </div>
        <div className="progress">
          <span />
        </div>
        <div className="panel-note">Your campus transportation hub.</div>
      </div>
    </section>
  )
}

export default Home