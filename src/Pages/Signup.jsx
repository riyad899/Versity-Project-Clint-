import { useState } from 'react'
import { Link } from 'react-router'

function Signup() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="auth-page">
      <div className="auth-intro">
        <p className="eyebrow">Start simply</p>
        <h1>Make room for better work.</h1>
        <p>Create your account and get your workspace ready for the next good idea.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card-heading"><span className="card-kicker">New workspace</span><h2>Sign up</h2></div>
        <label htmlFor="name">Full name<input id="name" name="name" type="text" autoComplete="name" required /></label>
        <label htmlFor="signup-email">Email address<input id="signup-email" name="email" type="email" autoComplete="email" required /></label>
        <label htmlFor="signup-password">Password<input id="signup-password" name="password" type="password" autoComplete="new-password" minLength="8" required /></label>
        {submitted && <p className="form-success" role="status">Your account request is ready to send.</p>}
        <button className="button button-primary button-full" type="submit">Create account</button>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </section>
  )
}

export default Signup