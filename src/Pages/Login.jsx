import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../Hooks/useAuth'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(form)
      navigate('/')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to log in. Check your details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-intro">
        <p className="eyebrow">Welcome back</p>
        <h1>Pick up where you left off.</h1>
        <p>Access your Northstar workspace with your admin credentials.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card-heading"><span className="card-kicker">Secure access</span><h2>Log in</h2></div>
        <label htmlFor="email">Email address<input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required /></label>
        <label htmlFor="password">Password<input id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary button-full" disabled={isSubmitting} type="submit">{isSubmitting ? 'Logging in...' : 'Log in'}</button>
        <p className="auth-switch">New here? <Link to="/signup">Create an account</Link></p>
      </form>
    </section>
  )
}

export default Login