import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/Hooks/useAuth'
import toast from 'react-hot-toast'
import {
  Menu,
  X,
  Bus,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  ChevronRight,
  User,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { cn } from '@/lib/utils'

export default function DashboardShell({
  roleTitle = 'Dashboard',
  roleSubtitle = 'Campus Transit System',
  roleBadge = 'User',
  roleBadgeVariant = 'softBlue',
  portalIcon: PortalIcon = Bus,
  navItems = [],
  activeTab,
  onTabChange,
  headerActions,
  children,
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout()
      toast.success('Logged out successfully!', { id: 'logout-toast', duration: 2500 })
      navigate('/login')
    }
  }

  const activeItem = navItems.find((item) => item.id === activeTab) || navItems[0]

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row antialiased text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Top Branding */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <PortalIcon className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-slate-950">
                    CampusMove
                  </span>
                  <Badge variant={roleBadgeVariant} className="text-[10px] px-2 py-0.5 capitalize">
                    {roleBadge}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">{roleSubtitle}</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick link to main website */}
          <div className="px-4 pt-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition-colors border border-dashed border-slate-200 hover:border-blue-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Public Website</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-2">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id)
                    setMobileOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer',
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25 font-bold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-500')} />}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-bold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-2xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-slate-500 truncate capitalize">{user?.role || 'Guest'}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sign Out"
              className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-9 w-9 text-slate-700"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>{roleTitle}</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-bold text-slate-900 capitalize">{activeItem?.label || activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {headerActions}
            <Badge variant="softBlue" className="hidden sm:inline-flex text-xs py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse mr-1" />
              System Online
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
