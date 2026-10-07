import { Link } from 'react-router'

function Home() {
  return (
    <section className="home-page">
      <div className="home-copy">
        <p className="eyebrow">Admin workspace</p>
        <h1>Run your work with a clearer view.</h1>
        <p className="home-description">
          Sign in to manage your dashboard, keep your team aligned, and move the important work forward.
        </p>
        <div className="home-actions">
          <Link className="button button-primary" to="/login">Log in</Link>
          <Link className="button button-secondary" to="/signup">Create account</Link>
        </div>
      </div>
      <div className="home-panel" aria-label="Workspace preview">
        <div className="panel-topline"><span /> <span /> <span /></div>
        <div className="panel-heading">Today at a glance</div>
        <div className="metric-row"><strong>24</strong><span>active projects</span><b>+12%</b></div>
        <div className="metric-row"><strong>86%</strong><span>team completion</span><b>steady</b></div>
        <div className="progress"><span /></div>
        <div className="panel-note">Your workspace is ready when you are.</div>
      </div>
    </section>
  )
}

export default Home