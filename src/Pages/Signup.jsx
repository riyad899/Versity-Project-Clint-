import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../Hooks/useAuth'
import toast from 'react-hot-toast'
import {
  Bus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Input } from '@/Components/ui/input'
import heroImage from '@/assets/image.png'

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
      toast.success('Account created successfully!', { id: 'signup-toast', duration: 2500 })

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
    <div className="min-h-screen w-full bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual / Branding Showcase */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden">
          {/* Background image overlay */}
          <div className="absolute inset-0 opacity-15 mix-blend-overlay">
            <img src={heroImage} alt="" className="h-full w-full object-cover" />
          </div>
          {/* Ambient blur circles */}
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

          {/* Top Brand Pill */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-md group-hover:scale-105 transition-transform">
                <Bus className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Campus<span className="text-sky-300">Move</span>
              </span>
            </Link>

            <div className="mt-8">
              <Badge variant="secondary" className="bg-white/15 text-white border-white/20 text-xs backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-sky-300" />
                Join Campus Transport
              </Badge>
              <h2 className="mt-4 text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                Create your campus transit account.
              </h2>
              <p className="mt-3 text-sm text-blue-100/90 leading-relaxed">
                Connect with university shuttle routes, get real-time stop announcements, and travel with ease every day.
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/15 space-y-3">
            <div className="flex items-center gap-3 text-xs font-semibold text-blue-100">
              <CheckCircle2 className="h-4 w-4 text-sky-300 shrink-0" />
              <span>Free registration for students, staff & faculty</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-blue-100">
              <CheckCircle2 className="h-4 w-4 text-sky-300 shrink-0" />
              <span>Personalized route planning & departure timetables</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-blue-100">
              <CheckCircle2 className="h-4 w-4 text-sky-300 shrink-0" />
              <span>Full role management for campus drivers & managers</span>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <Badge variant="softBlue" className="text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Quick Registration
              </Badge>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Sign Up
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Join the campus transit network in less than a minute.
              </p>
            </div>

            {error && (
              <div
                className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs font-semibold text-rose-800 animate-in fade-in"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 block"
                >
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Riyadus Salehin"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50/40 text-sm focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="signup-email"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 block"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="e.g. name@campus.edu"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50/40 text-sm focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="signup-password"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 block"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="signup-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 h-12 rounded-xl border-slate-200 bg-slate-50/40 text-sm focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all mt-3"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Switch to Login */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup