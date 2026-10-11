import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../Hooks/useAuth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
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
      const createdUser = await signup(form)
      toast.success('Account created successfully!')

      const userRole = createdUser?.role || 'user'
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
      let msg = 'Unable to create account. Please try again.'

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
        <p className="eyebrow">Get started</p>
        <h1>Join Versity Transport.</h1>
        <p>Create your campus account and start using unified campus transportation services.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card-heading">
          <span className="card-kicker">New account</span>
          <h2>Sign up</h2>
        </div>

        {error && (
          <div className="form-error-banner" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <label htmlFor="name">
          Full name
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="e.g. John Doe"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="signup-email">
          Email address
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="e.g. name@campus.edu"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="signup-password">
          Password
          <div className="password-input-wrapper">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              minLength="6"
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
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  )
}

export default Signup