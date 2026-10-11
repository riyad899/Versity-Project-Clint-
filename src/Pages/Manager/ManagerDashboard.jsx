import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../Hooks/Axios'
import toast from 'react-hot-toast'
import {
  Users,
  Bus,
  UserPlus,
  Plus,
  Pencil,
  Trash2,
  Search,
  Route,
  Clock,
  CheckCircle2,
  ClipboardList,
  X,
  User,
  ArrowRight,
  MapPin,
} from 'lucide-react'
import { useAuth } from '../../Hooks/useAuth'
import DashboardShell from '@/Components/Dashboard/DashboardShell'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Input } from '@/Components/ui/input'

const BUS_STATUS = ['active', 'maintenance', 'inactive']

export default function ManagerDashboard() {
  const { user: currentAuthUser } = useAuth()
  // Sidebar tabs: 'users', 'bus-infos', 'driver-assign'
  const [activeTab, setActiveTab] = useState('users')

  // Data states
  const [users, setUsers] = useState([])
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Modals
  const [showBusModal, setShowBusModal] = useState(false)
  const [editingBus, setEditingBus] = useState(null)
  const [busForm, setBusForm] = useState({
    busNumber: '',
    name: '',
    licensePlate: '',
    capacity: '',
    status: 'active',
  })

  const [assignDriverModal, setAssignDriverModal] = useState(null)
  const [selectedDriverId, setSelectedDriverId] = useState('')

  const [assignRouteModal, setAssignRouteModal] = useState(null)
  const [selectedRouteId, setSelectedRouteId] = useState('')

  const [showRouteModal, setShowRouteModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState(null)
  const [routeForm, setRouteForm] = useState({
    routeName: '',
    startPoint: '',
    endPoint: '',
    stops: '',
    scheduleTimes: '',
    status: 'active',
  })

  // ---- Fetch functions ----
  const fetchUsers = useCallback(async () => {
    try {
      const params = search ? { search } : {}
      const res = await apiClient.get('/api/v1/transportation-managers/users', { params })
      setUsers(res.data?.data || [])
    } catch {
      // fallback
    }
  }, [search])

  const fetchBuses = useCallback(async () => {
    try {
      const params = search ? { search } : {}
      const res = await apiClient.get('/api/v1/buses', { params })
      setBuses(res.data?.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load buses')
    }
  }, [search])

  const fetchRoutes = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/routes')
      setRoutes(res.data?.data || [])
    } catch {
      // ignore
    }
  }, [])

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/transportation-managers/drivers')
      setDrivers(res.data?.data || [])
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'bus-infos') {
      fetchBuses()
    } else if (activeTab === 'driver-assign') {
      fetchBuses()
      fetchDrivers()
      fetchRoutes()
    }
  }, [activeTab, fetchUsers, fetchBuses, fetchDrivers, fetchRoutes])

  // ---- MAKE DRIVER ----
  const handleMakeDriver = async (user) => {
    if (!window.confirm(`Are you sure you want to promote "${user.name}" to Driver?`)) {
      return
    }
    try {
      await apiClient.patch(`/api/v1/transportation-managers/users/${user._id || user.id}/make-driver`)
      toast.success(`${user.name} promoted to Driver successfully!`)
      fetchUsers()
      fetchDrivers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote user')
    }
  }

  // ---- BUS CRUD ----
  const resetBusForm = () => {
    setEditingBus(null)
    setBusForm({
      busNumber: '',
      name: '',
      licensePlate: '',
      capacity: '',
      status: 'active',
    })
  }

  const handleBusSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        busNumber: busForm.busNumber,
        name: busForm.name,
        licensePlate: busForm.licensePlate,
        capacity: Number(busForm.capacity),
        status: busForm.status,
      }

      if (editingBus) {
        await apiClient.patch(`/api/v1/buses/${editingBus._id || editingBus.id}`, payload)
        toast.success('Bus details updated successfully!')
      } else {
        await apiClient.post('/api/v1/buses', payload)
        toast.success('New bus added successfully!')
      }

      setShowBusModal(false)
      resetBusForm()
      fetchBuses()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.errorSources?.[0]?.message ||
          'Failed to save bus'
      )
    }
  }

  const startEditBus = (bus) => {
    setEditingBus(bus)
    setBusForm({
      busNumber: bus.busNumber,
      name: bus.name,
      licensePlate: bus.licensePlate,
      capacity: bus.capacity,
      status: bus.status,
    })
    setShowBusModal(true)
  }

  const handleDeleteBus = async (bus) => {
    if (!window.confirm(`Are you sure you want to delete bus "${bus.name}" (${bus.busNumber})?`)) {
      return
    }
    try {
      await apiClient.delete(`/api/v1/buses/${bus._id || bus.id}`)
      toast.success('Bus removed successfully!')
      fetchBuses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete bus')
    }
  }

  // ---- ASSIGN DRIVER ----
  const handleAssignDriver = async (e) => {
    e.preventDefault()
    if (!assignDriverModal) return
    try {
      const busId = assignDriverModal._id || assignDriverModal.id
      await apiClient.patch(`/api/v1/buses/${busId}/assign-driver`, {
        driverId: selectedDriverId || null,
      })
      toast.success(selectedDriverId ? 'Driver assigned to bus!' : 'Driver unassigned from bus!')
      setAssignDriverModal(null)
      fetchBuses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign driver')
    }
  }

  // ---- ASSIGN ROUTE ----
  const handleAssignRoute = async (e) => {
    e.preventDefault()
    if (!assignRouteModal) return
    try {
      const busId = assignRouteModal._id || assignRouteModal.id
      await apiClient.patch(`/api/v1/buses/${busId}/assign-route`, {
        routeId: selectedRouteId || null,
      })
      toast.success(selectedRouteId ? 'Route assigned to bus!' : 'Route unassigned from bus!')
      setAssignRouteModal(null)
      fetchBuses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign route')
    }
  }

  // ---- ROUTE CRUD ----
  const resetRouteForm = () => {
    setRouteForm({
      routeName: '',
      startPoint: '',
      endPoint: '',
      stops: '',
      scheduleTimes: '',
      status: 'active',
    })
    setEditingRoute(null)
  }

  const handleRouteSubmit = async (e) => {
    e.preventDefault()
    try {
      const stopsArr = routeForm.stops
        ? routeForm.stops
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : []
      const timesArr = routeForm.scheduleTimes
        ? routeForm.scheduleTimes
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []

      const payload = {
        routeName: routeForm.routeName,
        startPoint: routeForm.startPoint,
        endPoint: routeForm.endPoint,
        stops: stopsArr,
        scheduleTimes: timesArr,
        status: routeForm.status,
      }

      if (editingRoute) {
        await apiClient.patch(`/api/v1/routes/${editingRoute._id || editingRoute.id}`, payload)
        toast.success('Route updated successfully!')
      } else {
        await apiClient.post('/api/v1/routes', payload)
        toast.success('Route created successfully!')
      }

      setShowRouteModal(false)
      resetRouteForm()
      fetchRoutes()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.errorSources?.[0]?.message ||
          'Failed to save route'
      )
    }
  }

  const startEditRoute = (route) => {
    setEditingRoute(route)
    setRouteForm({
      routeName: route.routeName,
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      stops: route.stops?.join(', ') || '',
      scheduleTimes: route.scheduleTimes?.join(', ') || '',
      status: route.status,
    })
    setShowRouteModal(true)
  }

  const handleDeleteRoute = async (route) => {
    if (!window.confirm(`Are you sure you want to delete route "${route.routeName}"?`)) {
      return
    }
    try {
      await apiClient.delete(`/api/v1/routes/${route._id || route.id}`)
      toast.success('Route deleted successfully!')
      fetchRoutes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete route')
    }
  }

  return (
    <DashboardShell
      roleTitle="Manager Portal"
      roleSubtitle="Transportation Operations"
      roleBadge="Manager"
      roleBadgeVariant="softGreen"
      portalIcon={ClipboardList}
      navItems={[
        {
          id: 'users',
          label: 'User Accounts',
          icon: Users,
          badge: users.length,
        },
        {
          id: 'bus-infos',
          label: 'Bus Fleet',
          icon: Bus,
          badge: buses.length,
        },
        {
          id: 'driver-assign',
          label: 'Driver & Route Assign',
          icon: Route,
        },
      ]}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab)
        setSearch('')
      }}
      headerActions={
        activeTab === 'bus-infos' ? (
          <Button
            type="button"
            onClick={() => {
              resetBusForm()
              setShowBusModal(true)
            }}
            className="h-9 px-3.5 text-xs sm:h-10 sm:px-4 sm:text-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Campus Bus
          </Button>
        ) : activeTab === 'driver-assign' ? (
          <Button
            type="button"
            onClick={() => {
              resetRouteForm()
              setShowRouteModal(true)
            }}
            className="h-9 px-3.5 text-xs sm:h-10 sm:px-4 sm:text-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Create Route
          </Button>
        ) : null
      }
    >
      {/* ========================================================= */}
      {/* TAB 1: USERS (Browse users, promote to driver)           */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Passenger & User Accounts
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Browse campus passengers and promote qualified students or staff to official drivers.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search passenger accounts by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {/* Table Card */}
          <Card className="border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="mt-3 text-sm font-medium">Loading user list...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No passenger accounts found</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm">
                  All active users may already have roles assigned or your search returned no matches.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5">Passenger Name</th>
                      <th className="px-5 py-3.5">Email Address</th>
                      <th className="px-5 py-3.5">Current Role</th>
                      <th className="px-5 py-3.5">Joined Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {users.map((u) => {
                      const uid = u._id || u.id
                      return (
                        <tr key={uid} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-2xs">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant="softBlue" className="capitalize text-xs">
                              Passenger
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs font-bold text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 hover:text-emerald-800"
                              onClick={() => handleMakeDriver(u)}
                            >
                              <UserPlus className="h-3.5 w-3.5 mr-1" /> Make Driver
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BUS INFOS (Manage bus fleet)                       */}
      {/* ========================================================= */}
      {activeTab === 'bus-infos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Campus Bus Fleet
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Register, configure, and manage university shuttle buses and operational statuses.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search buses by number, name, or plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {/* Table Card */}
          <Card className="border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="mt-3 text-sm font-medium">Loading buses...</p>
              </div>
            ) : buses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                  <Bus className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No buses registered yet</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm">
                  Click "Add Campus Bus" above to add your first bus to the fleet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5">Bus Number</th>
                      <th className="px-5 py-3.5">Bus Model / Name</th>
                      <th className="px-5 py-3.5">License Plate</th>
                      <th className="px-5 py-3.5">Capacity</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {buses.map((bus) => {
                      const bid = bus._id || bus.id
                      return (
                        <tr key={bid} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <Badge variant="secondary" className="font-mono font-bold text-xs">
                              #{bus.busNumber}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <strong className="text-slate-900 font-bold">{bus.name}</strong>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                            {bus.licensePlate}
                          </td>
                          <td className="px-5 py-3.5 text-slate-700">
                            <span className="font-bold text-slate-900">{bus.capacity}</span> seats
                          </td>
                          <td className="px-5 py-3.5">
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
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                title="Edit Bus Details"
                                onClick={() => startEditBus(bus)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                title="Delete Bus"
                                onClick={() => handleDeleteBus(bus)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DRIVER ASSIGN (Driver & route mapping)             */}
      {/* ========================================================= */}
      {activeTab === 'driver-assign' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Driver & Route Assignments
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pair campus drivers with buses and bind buses to specific transit routes.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search buses to assign drivers or routes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {/* Bus Assignment Table */}
          <Card className="border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="py-4 px-5 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bus className="h-4 w-4 text-blue-600" /> Fleet Assignment Overview
              </CardTitle>
            </CardHeader>
            {buses.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No buses found. Add buses in the "Bus Fleet" tab first.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5">Bus Information</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Assigned Driver</th>
                      <th className="px-5 py-3.5">Assigned Route</th>
                      <th className="px-5 py-3.5 text-right">Assignments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {buses.map((bus) => {
                      const bid = bus._id || bus.id
                      return (
                        <tr key={bid} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Badge variant="secondary" className="font-mono font-bold text-xs">
                                #{bus.busNumber}
                              </Badge>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {bus.name}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">
                                  {bus.licensePlate} • {bus.capacity} seats
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
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
                          </td>
                          <td className="px-5 py-3.5">
                            {bus.assignedDriver ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-xs font-bold text-white shadow-2xs">
                                  {bus.assignedDriver.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 text-xs block">
                                    {bus.assignedDriver.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500 block">
                                    {bus.assignedDriver.email}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No driver assigned</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {bus.assignedRoute ? (
                              <div>
                                <strong className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                                  <Route className="h-3 w-3" /> {bus.assignedRoute.routeName}
                                </strong>
                                <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  {bus.assignedRoute.startPoint} <ArrowRight className="h-2.5 w-2.5" />{' '}
                                  {bus.assignedRoute.endPoint}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No route assigned</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => {
                                  setAssignDriverModal(bus)
                                  setSelectedDriverId(
                                    bus.assignedDriver?._id || bus.assignedDriver?.id || ''
                                  )
                                }}
                              >
                                <User className="h-3.5 w-3.5 mr-1" />
                                {bus.assignedDriver ? 'Change Driver' : 'Assign Driver'}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => {
                                  setAssignRouteModal(bus)
                                  setSelectedRouteId(
                                    bus.assignedRoute?._id || bus.assignedRoute?.id || ''
                                  )
                                }}
                              >
                                <Route className="h-3.5 w-3.5 mr-1" />
                                {bus.assignedRoute ? 'Change Route' : 'Assign Route'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Configured Routes Sub-Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Configured Campus Routes ({routes.length})
                </h3>
                <p className="text-xs text-slate-500">
                  List of established origin-to-destination pathways across the campus.
                </p>
              </div>
            </div>

            <Card className="border-slate-200/80 shadow-xs overflow-hidden">
              {routes.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No routes registered yet. Click "Create Route" above to add one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-3.5">Route Name</th>
                        <th className="px-5 py-3.5">Origin</th>
                        <th className="px-5 py-3.5">Destination</th>
                        <th className="px-5 py-3.5">Stops</th>
                        <th className="px-5 py-3.5">Departures</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {routes.map((r) => (
                        <tr key={r._id || r.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">{r.routeName}</td>
                          <td className="px-5 py-3.5 text-slate-700">{r.startPoint}</td>
                          <td className="px-5 py-3.5 text-slate-700">{r.endPoint}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {r.stops?.join(', ') || 'Direct non-stop'}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {r.scheduleTimes?.join(', ') || 'Flexible'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                title="Edit Route"
                                onClick={() => startEditRoute(r)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                title="Delete Route"
                                onClick={() => handleDeleteRoute(r)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT BUS                                     */}
      {/* ========================================================= */}
      {showBusModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setShowBusModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {editingBus ? 'Edit Bus Information' : 'Add New Campus Bus'}
                </h3>
                <p className="text-xs text-slate-500">
                  Enter identification number, vehicle name, and seating parameters
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowBusModal(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleBusSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Bus Number (ID) *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. BUS-101"
                    value={busForm.busNumber}
                    onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Model / Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Scania City Express"
                    value={busForm.name}
                    onChange={(e) => setBusForm({ ...busForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    License Plate *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. DHA-GA-9876"
                    value={busForm.licensePlate}
                    onChange={(e) => setBusForm({ ...busForm, licensePlate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Seating Capacity *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 45"
                    value={busForm.capacity}
                    onChange={(e) => setBusForm({ ...busForm, capacity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Operational Status
                </label>
                <select
                  value={busForm.status}
                  onChange={(e) => setBusForm({ ...busForm, status: e.target.value })}
                  className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  {BUS_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBusModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBus ? 'Save Changes' : 'Create Bus'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ASSIGN DRIVER TO BUS                               */}
      {/* ========================================================= */}
      {assignDriverModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setAssignDriverModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Assign Driver: {assignDriverModal.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Select a licensed driver for bus #{assignDriverModal.busNumber}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setAssignDriverModal(null)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleAssignDriver} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Campus Driver
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- No Driver (Unassigned) --</option>
                  {drivers.map((d) => (
                    <option key={d._id || d.id} value={d._id || d.id}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssignDriverModal(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ASSIGN ROUTE TO BUS                                */}
      {/* ========================================================= */}
      {assignRouteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setAssignRouteModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Assign Route: {assignRouteModal.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Select a destination route for bus #{assignRouteModal.busNumber}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setAssignRouteModal(null)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleAssignRoute} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Transit Route
                </label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- No Route (Unassigned) --</option>
                  {routes.map((r) => (
                    <option key={r._id || r.id} value={r._id || r.id}>
                      {r.routeName} ({r.startPoint} → {r.endPoint})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssignRouteModal(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT ROUTE                                   */}
      {/* ========================================================= */}
      {showRouteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setShowRouteModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {editingRoute ? 'Edit Campus Route' : 'Create New Campus Route'}
                </h3>
                <p className="text-xs text-slate-500">
                  Specify starting point, campus terminus, intermediate stops, and times
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowRouteModal(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleRouteSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Route Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. North Quad Express"
                  value={routeForm.routeName}
                  onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Starting Point *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Main Campus Gate"
                    value={routeForm.startPoint}
                    onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    End Point *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Science Complex"
                    value={routeForm.endPoint}
                    onChange={(e) => setRouteForm({ ...routeForm, endPoint: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Stops (Comma separated)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Library Plaza, Gym, Tech Hall"
                  value={routeForm.stops}
                  onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Schedule Times (Comma separated)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 08:30 AM, 11:00 AM, 03:30 PM"
                  value={routeForm.scheduleTimes}
                  onChange={(e) => setRouteForm({ ...routeForm, scheduleTimes: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Route Status
                </label>
                <select
                  value={routeForm.status}
                  onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value })}
                  className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRouteModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRoute ? 'Save Changes' : 'Create Route'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
