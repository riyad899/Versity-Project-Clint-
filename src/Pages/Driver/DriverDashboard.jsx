import { useState, useEffect } from 'react'
import { useAuth } from '../../Hooks/useAuth'
import apiClient from '../../Hooks/Axios'
import toast from 'react-hot-toast'
import {
  Bus,
  Route,
  Clock,
  Search,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  User,
} from 'lucide-react'
import DashboardShell from '@/Components/Dashboard/DashboardShell'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Input } from '@/Components/ui/input'

export default function DriverDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('bus-infos') // 'bus-infos' or 'my-buses'
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/api/v1/buses')
        setBuses(res.data?.data || [])
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load bus fleet data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const driverId = user?._id || user?.id

  const myBuses = buses.filter((b) => {
    const assignedId = b.assignedDriver?._id || b.assignedDriver?.id || b.assignedDriver
    return assignedId === driverId
  })

  const filteredBuses = (activeTab === 'my-buses' ? myBuses : buses).filter((bus) => {
    if (!search) return true
    return (
      bus.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
      bus.name?.toLowerCase().includes(search.toLowerCase()) ||
      bus.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
      bus.assignedRoute?.routeName?.toLowerCase().includes(search.toLowerCase()) ||
      bus.assignedRoute?.startPoint?.toLowerCase().includes(search.toLowerCase()) ||
      bus.assignedRoute?.endPoint?.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <DashboardShell
      roleTitle="Driver Portal"
      roleSubtitle="Fleet & Route Operations"
      roleBadge="Driver"
      roleBadgeVariant="softAmber"
      portalIcon={Bus}
      navItems={[
        {
          id: 'bus-infos',
          label: 'Campus Bus Fleet',
          icon: Bus,
          badge: buses.length,
        },
        {
          id: 'my-buses',
          label: 'My Assigned Buses',
          icon: UserCheck,
          badge: myBuses.length,
        },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6">
        {/* Title Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {activeTab === 'my-buses'
              ? 'My Assigned Campus Buses'
              : 'Campus Fleet Information'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {activeTab === 'my-buses'
              ? 'Buses and schedules specifically assigned to you by campus transit management.'
              : 'View-only fleet catalogue, assigned drivers, and scheduled route pathways.'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200/80 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-950">{myBuses.length}</div>
                <div className="text-xs font-semibold text-slate-500">My Assigned Buses</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-950">{buses.length}</div>
                <div className="text-xs font-semibold text-slate-500">Total Fleet Vehicles</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-950">
                  {buses.filter((b) => b.status === 'active').length}
                </div>
                <div className="text-xs font-semibold text-slate-500">Active On Duty</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by bus number, model, or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Fleet Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-sm font-medium">Loading bus fleet information...</p>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3">
              <Bus className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {activeTab === 'my-buses'
                ? 'No buses currently assigned to you'
                : 'No campus buses found'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {activeTab === 'my-buses'
                ? 'Your transportation manager has not assigned any bus to your driver account yet.'
                : 'Try adjusting your search query.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBuses.map((bus) => {
              const isAssignedToMe =
                (bus.assignedDriver?._id || bus.assignedDriver?.id || bus.assignedDriver) ===
                driverId

              return (
                <Card
                  key={bus._id || bus.id}
                  className={`border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between ${
                    isAssignedToMe ? 'ring-2 ring-blue-600 border-blue-500' : ''
                  }`}
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
                    {isAssignedToMe && (
                      <div className="pt-1">
                        <Badge variant="softBlue" className="text-xs font-bold">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Assigned to You
                        </Badge>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-2 text-xs py-1 border-b border-slate-100">
                      <div>
                        <span className="text-slate-400 block font-medium">Plate Number</span>
                        <strong className="text-slate-800 font-mono">{bus.licensePlate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Capacity</span>
                        <strong className="text-slate-800">{bus.capacity} seats</strong>
                      </div>
                    </div>

                    {/* Route Details */}
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

                    {/* Driver status */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {bus.assignedDriver ? (
                        isAssignedToMe ? (
                          <span className="font-bold text-blue-600">You are driving this bus</span>
                        ) : (
                          <span>
                            Driver: <strong>{bus.assignedDriver.name}</strong>
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 italic">Driver: Unassigned</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
