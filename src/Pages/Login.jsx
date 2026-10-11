import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../Hooks/useAuth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setError('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const loggedUser = await login(form)
      toast.success('Logged in successfully!')

      const userRole = loggedUser?.role || 'user'
      switch (userRole) {
        case 'admin':
          navigate('/admin')
          break
        case 'transportation-manager':
          navigate('/manager')
          break
        case 'driver':
          navigate('/driver')
          break
        default:
          navigate('/passenger')
          break
      }
    } catch (err) {
      let msg = 'Unable to log in. Please check your email and password.'

      const resp = err.response?.data
      if (resp?.errorSources?.[0]?.message) {
        msg = resp.errorSources[0].message
      } else if (resp?.message && resp.message !== 'Validation Error') {
        msg = resp.message
      } else if (err.message) {
        msg = err.message
      }

      setError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-intro">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to your account.</h1>
        <p>Enter your email and password to access your role-based campus transit dashboard.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card-heading">
          <span className="card-kicker">Secure access</span>
          <h2>Log in</h2>
        </div>

        {error && (
          <div className="form-error-banner" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <label htmlFor="email">
          Email address
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="e.g. name@campus.edu"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="password">
          Password
          <div className="password-input-wrapper">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <button className="button button-primary button-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </section>
  )
}

export default Login