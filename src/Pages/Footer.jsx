import { Link } from 'react-router'
import { Bus, Shield, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-100 bg-white pt-12 pb-8 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 border-b border-slate-100 pb-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <Bus className="h-4 w-4" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Campus<span className="text-blue-600">Move</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <a href="#search-routes" className="hover:text-blue-600 transition-colors">Routes</a>
            <a href="#explore-services" className="hover:text-blue-600 transition-colors">Bus Fleet</a>
            <a href="#explore-services" className="hover:text-blue-600 transition-colors">Schedules</a>
            <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-xs text-slate-400 sm:flex-row">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-blue-500" />
            <span>Safe &amp; Reliable Campus Transit System</span>
          </div>
          <p>© {new Date().getFullYear()} CampusMove. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}