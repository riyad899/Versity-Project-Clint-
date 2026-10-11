import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../Hooks/useAuth'
import apiClient from '../Hooks/Axios'
import {
  Calendar,
  ArrowRight,
  ArrowLeftRight,
  MapPin,
  Search,
  ChevronDown,
  X,
  CheckCircle2,
  Sparkles,
  Bus,
  ShieldCheck,
  Clock,
  Users,
  Map as MapIcon,
  UserRound,
} from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import heroImage from '@/assets/Sunny Campus Bus Stop Panorama.png'

const SERVICE_IMAGES = { fleet: null, routes: null, drivers: null }

const DEFAULT_LOCATIONS = [
  'Main Campus Gate',
  'Central Library Plaza',
  'North Hall Dormitories',
  'Science & Tech Complex',
  'Business School Quad',
  'Sports Arena & Gym',
  'Student Center & Dining',
  'South Residential Village',
]

function ServiceArt({ image, gradient, Icon }) {
  if (image) {
    return <img src={image} alt="" className="h-full w-full object-cover" />
  }
  return (
    <div className={`flex h-full w-full items-center justify-center ${gradient}`}>
      <Icon className="h-14 w-14 text-white/70" strokeWidth={1.5} />
    </div>
  )
}

function Home() {
  const { user } = useAuth()

  // Route finder state
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split('T')[0])

  // Dynamic route data
  const [routes, setRoutes] = useState([])
  const [availableLocations, setAvailableLocations] = useState(DEFAULT_LOCATIONS)
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await apiClient.get('/api/v1/routes')
        const data = res.data?.data || res.data || []
        if (Array.isArray(data) && data.length > 0) {
          setRoutes(data)
          const locSet = new Set(DEFAULT_LOCATIONS)
          data.forEach((r) => {
            if (r.startPoint) locSet.add(r.startPoint)
            if (r.endPoint) locSet.add(r.endPoint)
            if (Array.isArray(r.stops)) r.stops.forEach((s) => s && locSet.add(s))
          })
          setAvailableLocations(Array.from(locSet))
        }
      } catch {
        // Fallback to defaults
      }
    }
    fetchRoutes()
  }, [])

  const handleSwapLocations = () => {
    setFromLocation(toLocation)
    setToLocation(fromLocation)
  }

  const handleFindRoutes = (e) => {
    if (e) e.preventDefault()
    setIsSearching(true)

    setTimeout(() => {
      if (routes.length > 0) {
        const f = fromLocation.toLowerCase()
        const t = toLocation.toLowerCase()
        const matches = routes.filter((r) => {
          const matchFrom =
            !f ||
            r.startPoint?.toLowerCase().includes(f) ||
            r.stops?.some((s) => s.toLowerCase().includes(f))
          const matchTo =
            !t ||
            r.endPoint?.toLowerCase().includes(t) ||
            r.stops?.some((s) => s.toLowerCase().includes(t))
          return matchFrom && matchTo
        })
        setSearchResults(matches.length > 0 ? matches : 'no-direct')
      } else {
        setSearchResults([
          {
            id: 'demo-1',
            routeName: 'Express Loop A',
            startPoint: fromLocation || 'Main Campus Gate',
            endPoint: toLocation || 'Science & Tech Complex',
            stops: ['Library Plaza', 'Student Center'],
            scheduleTimes: ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'],
          },
          {
            id: 'demo-2',
            routeName: 'Campus Shuttle Line B',
            startPoint: fromLocation || 'North Hall Dormitories',
            endPoint: toLocation || 'Sports Arena & Gym',
            stops: ['Business School Quad', 'Dining Hall'],
            scheduleTimes: ['08:15 AM', '08:45 AM', '09:15 AM', '09:45 AM'],
          },
        ])
      }
      setIsSearching(false)
    }, 300)
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
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

  const scrollToPlanner = () =>
    document.getElementById('interactive-planner')?.scrollIntoView({ behavior: 'smooth' })

  const features = [
    { icon: ShieldCheck, title: 'Safe Transport', text: 'Your safety is our priority' },
    { icon: Clock, title: 'Reliable Schedules', text: 'Always on time, every day' },
    { icon: Users, title: 'Easy Access', text: 'Simple booking and real-time information' },
  ]

  const services = [
    {
      key: 'fleet',
      title: 'Campus Bus Fleet',
      text: 'Explore our modern and well-maintained bus fleet for a comfortable journey.',
      icon: Bus,
      gradient: 'bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700',
      to: getDashboardLink(),
    },
    {
      key: 'routes',
      title: 'Routes & Schedules',
      text: 'Find all campus routes and bus schedules easily in one place.',
      icon: MapIcon,
      gradient: 'bg-gradient-to-br from-emerald-300 via-teal-500 to-sky-700',
      onClick: () => setShowScheduleModal(true),
    },
    {
      key: 'drivers',
      title: 'Driver & Bus Assignments',
      text: 'View driver information and bus assignments for each route.',
      icon: UserRound,
      gradient: 'bg-gradient-to-br from-indigo-400 via-blue-600 to-slate-800',
      to: getDashboardLink(),
    },
  ]

  const fieldBase =
    'flex h-[58px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition-colors hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'

  return (
    <div className="relative w-full bg-white text-slate-800">
      {/* ======================== HERO ======================== */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-sky-100 to-white">
        <img
          src={heroImage}
          alt="Campus Bus Transport"
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
        {/* white fade on the left so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent sm:via-white/70 lg:via-white/40" />

        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 sm:pb-32 sm:pt-12 lg:px-8 lg:pb-36 lg:pt-16">
          {user && (
            <div className="mb-6 flex max-w-xl items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/90 px-4 py-2.5 text-xs font-medium text-blue-900 shadow-2xs backdrop-blur">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>
                  Welcome back, <strong>{user.name}</strong>!{' '}
                  <Badge variant="softBlue" className="ml-1 text-[11px] capitalize">
                    {user.role}
                  </Badge>
                </span>
              </div>
              <Link
                to={getDashboardLink()}
                className="whitespace-nowrap font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Dashboard →
              </Link>
            </div>
          )}

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70">
              <ShieldCheck className="h-4 w-4 fill-blue-600 text-white" />
              Safe • Comfortable • On Time
            </span>

            <h1 className="mt-5 text-4xl font-black uppercase leading-[0.98] tracking-tight text-slate-950 sm:text-5xl lg:text-[64px]">
              Smarter
              <br />
              <span className="text-blue-600">Campus Travel,</span>
              <br />
              Every Day
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
              Manage bus routes, view schedules, and keep every journey organized.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={scrollToPlanner}
                className="h-12 cursor-pointer rounded-lg bg-blue-600 px-6 text-sm font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700"
              >
                Explore Routes
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScheduleModal(true)}
                className="h-12 cursor-pointer rounded-lg border-slate-800 bg-white/80 px-6 text-sm font-bold text-slate-900 hover:bg-white"
              >
                <Calendar className="h-4 w-4" />
                View Bus Schedule
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== ROUTE FINDER ======================== */}
      <section
        id="interactive-planner"
        className="relative z-10 mx-auto -mt-20 max-w-7xl scroll-mt-24 px-4 sm:-mt-24 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl shadow-slate-300/50 sm:p-4 lg:rounded-3xl">
          <form
            onSubmit={handleFindRoutes}
            className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto]"
          >
            {/* FROM */}
            <div className={fieldBase}>
              <MapPin className="h-5 w-5 shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold leading-none text-slate-900">From</div>
                <select
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="mt-1 w-full cursor-pointer truncate bg-transparent text-sm text-slate-500 outline-none"
                >
                  <option value="">Select departure location</option>
                  {availableLocations.map((loc) => (
                    <option key={`from-${loc}`} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
            </div>

            {/* SWAP */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-transform duration-200 hover:scale-105 hover:bg-blue-100 active:scale-95 max-md:rotate-90"
                title="Swap departure and destination"
                aria-label="Swap departure and destination"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </button>
            </div>

            {/* TO */}
            <div className={fieldBase}>
              <MapPin className="h-5 w-5 shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold leading-none text-slate-900">To</div>
                <select
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="mt-1 w-full cursor-pointer truncate bg-transparent text-sm text-slate-500 outline-none"
                >
                  <option value="">Select destination</option>
                  {availableLocations.map((loc) => (
                    <option key={`to-${loc}`} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
            </div>

            {/* DATE */}
            <div className={fieldBase}>
              <Calendar className="h-5 w-5 shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold leading-none text-slate-900">
                  Travel Date
                </div>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="mt-1 w-full cursor-pointer bg-transparent text-sm text-slate-500 outline-none"
                />
              </div>
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              size="lg"
              disabled={isSearching}
              className="h-[58px] w-full cursor-pointer rounded-xl bg-blue-600 px-8 text-base font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 md:w-auto"
            >
              <Search className="h-5 w-5" />
              <span>{isSearching ? 'Searching...' : 'Find Routes'}</span>
            </Button>
          </form>

          {/* Results */}
          {searchResults && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Search Results
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchResults(null)}
                  className="cursor-pointer text-slate-400 hover:text-slate-600"
                  aria-label="Clear results"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {searchResults === 'no-direct' ? (
                <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-600">
                  No direct campus route found for this pair. Try selecting nearby stops or
                  check the full schedule.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {searchResults.map((r, i) => (
                    <div
                      key={r.id || r._id || i}
                      className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors hover:border-blue-300"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">{r.routeName}</span>
                          <Badge variant="softBlue" className="text-[11px]">
                            Active Route
                          </Badge>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-slate-600">
                          <span>{r.startPoint}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span>{r.endPoint}</span>
                        </div>
                        {r.stops?.length > 0 && (
                          <p className="mt-1.5 text-[11px] text-slate-500">
                            Stops: {r.stops.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-xs">
                        <span className="text-slate-500">
                          Times: {r.scheduleTimes?.slice(0, 3).join(', ') || 'Regular intervals'}
                        </span>
                        <Link
                          to={user ? getDashboardLink() : '/login'}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          Book / View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ======================== FEATURES ROW ======================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0">
          {features.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className={`flex items-center gap-4 md:justify-center md:px-6 ${
                i > 0 ? 'md:border-l md:border-slate-200' : ''
              }`}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <Icon className="h-7 w-7 text-blue-600" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[15px] font-bold text-slate-900">{title}</div>
                <div className="text-sm text-slate-500">{text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================== OUR BUS SERVICES ======================== */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Explore
            </span>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-slate-950 sm:text-4xl">
              Our Bus Services
            </h2>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              CampusMove provides a complete bus management solution to make campus travel
              easier, safer and more organized.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScheduleModal(true)}
              className="h-11 w-fit cursor-pointer rounded-lg border-slate-200 bg-white px-5 text-xs font-bold text-slate-900 shadow-2xs hover:bg-slate-50"
            >
              View All Services
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon
            const inner = (
              <>
                <div className="h-44 w-full overflow-hidden">
                  <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                    <ServiceArt
                      image={SERVICE_IMAGES[s.key]}
                      gradient={s.gradient}
                      Icon={Icon}
                    />
                  </div>
                </div>
                <div className="relative flex items-center gap-4 px-5 pb-5 pt-4">
                  <div className="-mt-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-white">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-slate-900">{s.title}</div>
                    <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{s.text}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-800 transition-colors group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </>
            )
            const cardClass =
              'group block w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-lg shadow-slate-200/70 transition-all hover:-translate-y-1 hover:shadow-xl'
            return s.to ? (
              <Link key={s.key} to={s.to} className={cardClass}>
                {inner}
              </Link>
            ) : (
              <button key={s.key} type="button" onClick={s.onClick} className={cardClass}>
                {inner}
              </button>
            )
          })}
        </div>
      </section>

      {/* ======================== SCHEDULE MODAL ======================== */}
      {showScheduleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Campus Bus Schedule</h3>
                <p className="text-xs text-slate-500">
                  Daily active departure timings across campus routes
                </p>
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setShowScheduleModal(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {routes.length > 0 ? (
                routes.map((r, i) => (
                  <div
                    key={r._id || r.id || i}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-900">{r.routeName}</span>
                      <span className="text-xs font-semibold text-blue-600">
                        {r.startPoint} → {r.endPoint}
                      </span>
                    </div>
                    {r.stops?.length > 0 && (
                      <p className="mt-1 text-xs text-slate-500">
                        Intermediate stops: {r.stops.join(', ')}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {r.scheduleTimes?.length > 0 ? (
                        r.scheduleTimes.map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">
                          Departures every 15-20 mins
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  {[
                    {
                      name: 'Line 1 - North Campus Express',
                      path: 'Main Gate → Science Complex',
                      times: ['07:45 AM', '08:15 AM', '08:45 AM', '09:15 AM', '10:00 AM'],
                    },
                    {
                      name: 'Line 2 - Residential Shuttle',
                      path: 'Dormitories → Central Library',
                      times: ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:15 AM'],
                    },
                  ].map((line) => (
                    <div
                      key={line.name}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-slate-900">{line.name}</span>
                        <span className="text-xs font-semibold text-blue-600">{line.path}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {line.times.map((t) => (
                          <span
                            key={t}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowScheduleModal(false)}
                className="rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home