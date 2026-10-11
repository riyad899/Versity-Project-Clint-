import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../Hooks/useAuth'
import apiClient from '../../Hooks/Axios'
import toast from 'react-hot-toast'
import {
  Search,
  Bus,
  Route,
  Clock,
  MapPin,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import DashboardShell from '@/Components/Dashboard/DashboardShell'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Input } from '@/Components/ui/input'

export default function PassengerDashboard() {
  const { user } = useAuth()
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('buses') // 'buses' or 'routes'

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [busRes, routeRes] = await Promise.all([
        apiClient.get('/api/v1/buses'),
        apiClient.get('/api/v1/routes'),
      ])
      setBuses(busRes.data?.data || [])
      setRoutes(routeRes.data?.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load transit data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      search === '' ||
      bus.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
      bus.name?.toLowerCase().includes(search.toLowerCase()) ||
      bus.assignedRoute?.routeName?.toLowerCase().includes(search.toLowerCase()) ||
      bus.assignedRoute?.startPoint?.toLowerCase().includes(search.toLowerCase()) ||
      bus.assignedRoute?.endPoint?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || bus.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredRoutes = routes.filter((route) => {
    if (!search) return true
    return (
      route.routeName?.toLowerCase().includes(search.toLowerCase()) ||
      route.startPoint?.toLowerCase().includes(search.toLowerCase()) ||
      route.endPoint?.toLowerCase().includes(search.toLowerCase()) ||
      (route.stops && route.stops.some((s) => s.toLowerCase().includes(search.toLowerCase())))
    )
  })

  return (
    <DashboardShell
      roleTitle="Passenger Portal"
      roleSubtitle="Live Campus Travel"
      roleBadge="Passenger"
      roleBadgeVariant="softBlue"
      portalIcon={Bus}
      navItems={[
        {
          id: 'buses',
          label: 'Available Buses',
          icon: Bus,
          badge: filteredBuses.length,
        },
        {
          id: 'routes',
          label: 'Campus Routes',
          icon: Route,
          badge: filteredRoutes.length,
        },
      ]}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab)
        setSearch('')
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Welcome, {user?.name || 'Passenger'}!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Explore live university shuttle buses, departure schedules, and campus stop locations.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200/80 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-950">
                  {buses.filter((b) => b.status === 'active').length}
                </div>
                <div className="text-xs font-semibold text-slate-500">Active Shuttle Buses</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Route className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-950">{routes.length}</div>
                <div className="text-xs font-semibold text-slate-500">Campus Routes</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-950">{buses.length}</div>
                <div className="text-xs font-semibold text-slate-500">Total Fleet Vehicles</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={
                activeTab === 'buses'
                  ? 'Search buses by number, model name, or route...'
                  : 'Search campus routes by name or destination...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {activeTab === 'buses' && (
            <select
              className="h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-2xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Operational Statuses</option>
              <option value="active">Active Only</option>
              <option value="maintenance">In Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-sm font-medium">Loading campus transit information...</p>
          </div>
        ) : activeTab === 'buses' ? (
          filteredBuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                <Bus className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No buses found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                Try adjusting your search terms or status filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBuses.map((bus) => (
                <Card
                  key={bus._id || bus.id}
                  className="border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono font-bold text-xs">
                          #{bus.busNumber}
                        </Badge>
                        <CardTitle className="text-base font-extrabold text-slate-950">
                          {bus.name}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={
                          bus.status === 'active'
                            ? 'softGreen'
                            : bus.status === 'maintenance'
                            ? 'softAmber'
                            : 'softRed'
                        }
                        className="capitalize text-xs"
                      >
                        {bus.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-2 text-xs py-1 border-b border-slate-100">
                      <div>
                        <span className="text-slate-400 block font-medium">License Plate</span>
                        <strong className="text-slate-800 font-mono">{bus.licensePlate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Capacity</span>
                        <strong className="text-slate-800">{bus.capacity} seats</strong>
                      </div>
                    </div>

                    {/* Route Box */}
                    {bus.assignedRoute ? (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                          <Route className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>{bus.assignedRoute.routeName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                          <span className="truncate">{bus.assignedRoute.startPoint}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{bus.assignedRoute.endPoint}</span>
                        </div>

                        {bus.assignedRoute.stops?.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {bus.assignedRoute.stops.map((stop, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-md bg-white border border-blue-200/60 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                              >
                                <MapPin className="h-2.5 w-2.5 text-blue-500" />
                                {stop}
                              </span>
                            ))}
                          </div>
                        )}

                        {bus.assignedRoute.scheduleTimes?.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1 border-t border-blue-100/60">
                            <Clock className="h-3 w-3 text-blue-600 shrink-0" />
                            <div className="flex flex-wrap gap-1">
                              {bus.assignedRoute.scheduleTimes.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-400 italic text-center">
                        Route: Not assigned yet
                      </div>
                    )}

                    {/* Driver Box */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {bus.assignedDriver ? (
                        <span>
                          Driver: <strong>{bus.assignedDriver.name}</strong>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Driver: Unassigned</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          /* Routes Tab */
          filteredRoutes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
                <Route className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No routes found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                Try searching for a different destination or campus building.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRoutes.map((route) => (
                <Card
                  key={route._id || route.id}
                  className="border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Route className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-base font-extrabold text-slate-950">
                          {route.routeName}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={route.status === 'active' ? 'softGreen' : 'softRed'}
                        className="capitalize text-xs"
                      >
                        {route.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 flex-1">
                    {/* Origin -> Terminus Banner */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Origin</span>
                        <strong className="text-slate-900 font-bold">{route.startPoint}</strong>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="text-right">
                        <span className="text-slate-400 block font-medium">Terminus</span>
                        <strong className="text-slate-900 font-bold">{route.endPoint}</strong>
                      </div>
                    </div>

                    {/* Stops List */}
                    {route.stops?.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Stops ({route.stops.length})
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {route.stops.map((stop, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                            >
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                                {idx + 1}
                              </span>
                              {stop}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Schedule Times */}
                    {route.scheduleTimes?.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Departures
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {route.scheduleTimes.map((t, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700"
                            >
                              <Clock className="h-3 w-3" /> {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </DashboardShell>
  )
}
