import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../Hooks/useAuth'
import toast from 'react-hot-toast'
import {
  Bus,
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  LayoutDashboard,
  Route,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Mail,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'

const ROLE_BG = {
  admin: 'bg-rose-600',
  'transportation-manager': 'bg-emerald-600',
  driver: 'bg-amber-600',
  user: 'bg-blue-600',
}

const ROLE_BADGE_VARIANTS = {
  admin: 'softRed',
  'transportation-manager': 'softGreen',
  driver: 'softAmber',
  user: 'softBlue',
}

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!', { id: 'logout-toast', duration: 2500 })
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
      'transportation-manager': 'Transport Manager',
      user: 'Passenger',
    }
    return labels[user.role] || user.role
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-transform hover:opacity-95"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30 transition-transform group-hover:scale-105">
            <Bus className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Campus<span className="text-blue-600">Move</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `relative text-sm font-semibold transition-colors hover:text-blue-600 ${
                isActive
                  ? 'text-blue-600 after:absolute after:-bottom-6 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-blue-600'
                  : 'text-slate-600'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/routes"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive ? 'font-semibold text-blue-600' : 'text-slate-600'
              }`
            }
            onClick={(e) => {
              if (window.location.pathname === '/') {
                const el = document.getElementById('interactive-planner')
                if (el) {
                  e.preventDefault()
                  el.scrollIntoView({ behavior: 'smooth' })
                }
              }
            }}
          >
            Routes
          </NavLink>
          <NavLink
            to="/buses"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive ? 'font-semibold text-blue-600' : 'text-slate-600'
              }`
            }
            onClick={(e) => {
              if (window.location.pathname === '/') {
                const el = document.getElementById('explore-services')
                if (el) {
                  e.preventDefault()
                  el.scrollIntoView({ behavior: 'smooth' })
                }
              }
            }}
          >
            Buses
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive ? 'font-semibold text-blue-600' : 'text-slate-600'
              }`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive ? 'font-semibold text-blue-600' : 'text-slate-600'
              }`
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Search"
            title="Search routes"
            onClick={() => {
              const el = document.getElementById('interactive-planner')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Search className="h-4 w-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-full p-1 pl-1 pr-3 transition-all hover:bg-slate-100/90 border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-2xs"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-2xs ${
                        ROLE_BG[user.role] || 'bg-blue-600'
                      }`}
                    >
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 capitalize">
                      {getRoleBadge()}
                    </span>
                  </div>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Popup */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl shadow-slate-900/10 z-50 animate-in fade-in zoom-in-95">
                    {/* Header: User image, name, email & role */}
                    <div className="p-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1.5">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div
                            className={`flex h-10 w-10 items-center justify-center  text-sm font-bold text-white shadow-2xs ${
                              ROLE_BG[user.role] || 'bg-blue-600'
                            }`}
                          >
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-950 truncate">
                            {user.name}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <Badge
                          variant={ROLE_BADGE_VARIANTS[user.role] || 'softBlue'}
                          className="text-[11px] capitalize"
                        >
                          {getRoleBadge()}
                        </Badge>
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      </div>
                    </div>

                    {/* Menu links */}
                    <div className="space-y-0.5">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-blue-600" />
                        <span>Dashboard Portal</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          setProfileModalOpen(true)
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                      >
                        <User className="h-4 w-4 text-slate-500" />
                        <span>View Profile</span>
                      </button>

                      <Link
                        to="/#interactive-planner"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Route className="h-4 w-4 text-slate-500" />
                        <span>Find Routes</span>
                      </Link>
                    </div>

                    <div className="my-1.5 border-t border-slate-100" />

                    {/* Logout inside menu */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        handleLogout()
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Beside user profile: Logout button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="rounded-lg border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 text-xs font-bold transition-colors"
                title="Log out of your account"
              >
                <LogOut className="h-3.5 w-3.5 mr-1 text-slate-500" />
                Log out
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button
                variant="default"
                size="sm"
                className="rounded-lg bg-blue-600 px-5 font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700"
              >
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-semibold text-blue-600"
            >
              Home
            </NavLink>
            <NavLink
              to="/routes"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-medium text-slate-600"
            >
              Routes
            </NavLink>
            <NavLink
              to="/buses"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-medium text-slate-600"
            >
              Buses
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-medium text-slate-600"
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-medium text-slate-600"
            >
              Contact
            </NavLink>

            <div className="mt-2 border-t border-slate-100 pt-3">
              {user ? (
                <div className="flex flex-col gap-3">
                  {/* Mobile user pill */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-2xs ${
                          ROLE_BG[user.role] || 'bg-blue-600'
                        }`}
                      >
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {user.name}
                        </span>
                        <Badge
                          variant={ROLE_BADGE_VARIANTS[user.role] || 'softBlue'}
                          className="text-[10px]"
                        >
                          {getRoleBadge()}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="default" className="w-full bg-blue-600">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard Portal
                    </Button>
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setProfileModalOpen(true)
                    }}
                    className="w-full"
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="default" className="w-full bg-blue-600">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================= PROFILE MODAL ======================= */}
      {profileModalOpen && user && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" /> User Profile
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setProfileModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Profile Avatar & Info Card */}
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-blue-100 shadow-md"
                />
              ) : (
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-md ${
                    ROLE_BG[user.role] || 'bg-blue-600'
                  }`}
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <h4 className="mt-3 text-lg font-extrabold text-slate-950">{user.name}</h4>
              <p className="text-xs text-slate-500 font-medium">{user.email}</p>

              <div className="mt-3 flex items-center gap-2">
                <Badge
                  variant={ROLE_BADGE_VARIANTS[user.role] || 'softBlue'}
                  className="text-xs capitalize px-3 py-1 font-bold"
                >
                  {getRoleBadge()}
                </Badge>
                <Badge variant="softGreen" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Active Status
                </Badge>
              </div>
            </div>

            {/* Details breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" /> Email Address
                </span>
                <span className="font-bold text-slate-900">{user.email}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-400" /> Account Authorization
                </span>
                <span className="font-bold text-slate-900 capitalize">{user.role}</span>
              </div>

              {user.createdAt && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" /> Member Since
                  </span>
                  <span className="font-bold text-slate-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
              <Link
                to={getDashboardPath()}
                onClick={() => setProfileModalOpen(false)}
                className="flex-1"
              >
                <Button variant="default" className="w-full bg-blue-600">
                  <LayoutDashboard className="h-4 w-4 mr-1.5" />
                  Go to Dashboard
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={() => setProfileModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}