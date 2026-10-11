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
} from 'lucide-react'
import { useAuth } from '../../Hooks/useAuth'

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
      // fallback if needed
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
    setLoading(true)
    Promise.all([fetchUsers(), fetchBuses(), fetchRoutes(), fetchDrivers()]).finally(() => {
      setLoading(false)
    })
  }, [fetchUsers, fetchBuses, fetchRoutes, fetchDrivers])

  // ---- PROMOTE USER TO DRIVER ----
  const handleMakeDriver = async (targetUser) => {
    if (!window.confirm(`Promote "${targetUser.name}" from Passenger to Driver?`)) {
      return
    }
    try {
      const uid = targetUser._id || targetUser.id
      await apiClient.patch(`/api/v1/transportation-managers/users/${uid}/make-driver`)
      toast.success(`${targetUser.name} is now registered as a Driver!`)
      fetchUsers()
      fetchDrivers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote user to driver')
    }
  }

  // ---- BUS CRUD ----
  const resetBusForm = () => {
    setBusForm({
      busNumber: '',
      name: '',
      licensePlate: '',
      capacity: '',
      status: 'active',
    })
    setEditingBus(null)
    setShowBusModal(false)
  }

  const handleBusSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...busForm,
      capacity: Number(busForm.capacity),
    }

    try {
      if (editingBus) {
        await apiClient.patch(`/api/v1/buses/${editingBus._id || editingBus.id}`, payload)
        toast.success('Bus information updated successfully!')
      } else {
        await apiClient.post('/api/v1/buses', payload)
        toast.success('New campus bus added successfully!')
      }
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
    setShowRouteModal(false)
  }

  const handleRouteSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      routeName: routeForm.routeName,
      startPoint: routeForm.startPoint,
      endPoint: routeForm.endPoint,
      status: routeForm.status,
      stops: routeForm.stops ? routeForm.stops.split(',').map((s) => s.trim()).filter(Boolean) : [],
      scheduleTimes: routeForm.scheduleTimes
        ? routeForm.scheduleTimes.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    }

    try {
      if (editingRoute) {
        await apiClient.patch(`/api/v1/routes/${editingRoute._id || editingRoute.id}`, payload)
        toast.success('Route updated successfully!')
      } else {
        await apiClient.post('/api/v1/routes', payload)
        toast.success('New campus route created!')
      }
      resetRouteForm()
      fetchRoutes()
      fetchBuses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save route')
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
    if (!window.confirm(`Delete route "${route.routeName}"?`)) return
    try {
      await apiClient.delete(`/api/v1/routes/${route._id || route.id}`)
      toast.success('Route deleted!')
      fetchRoutes()
      fetchBuses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete route')
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">
            <ClipboardList size={20} />
          </span>
          <div>
            <h3>Manager Portal</h3>
            <p>Campus Transportation</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('users')
              setSearch('')
            }}
          >
            <Users className="sidebar-icon" size={18} />
            <span>Users</span>
            <span className="sidebar-counter">{users.length}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'bus-infos' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('bus-infos')
              setSearch('')
            }}
          >
            <Bus className="sidebar-icon" size={18} />
            <span>Bus Infos</span>
            <span className="sidebar-counter">{buses.length}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'driver-assign' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('driver-assign')
              setSearch('')
            }}
          >
            <UserPlus className="sidebar-icon" size={18} />
            <span>Driver Assign</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-pill">
            <div className="user-avatar" style={{ background: '#10b981' }}>
              {currentAuthUser?.name?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div className="sidebar-user-text">
              <strong>{currentAuthUser?.name || 'Transport Manager'}</strong>
              <span className="badge badge-green">Manager</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* ========================================================= */}
        {/* TAB 1: USERS (Manager can view users and promote to driver) */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <div>
            <div className="content-header">
              <div>
                <h2>Passenger & User Accounts</h2>
                <p className="content-subtitle">
                  Browse campus users and promote registered passengers to official campus drivers.
                </p>
              </div>
            </div>

            <div className="filter-bar">
              <div className="search-box">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search passenger accounts by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrap">
              {loading ? (
                <div className="loading-screen">
                  <div className="spinner" />
                  <p>Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <div className="stat-icon" style={{ margin: '0 auto 12px', background: 'rgba(31, 89, 73, 0.1)', color: 'var(--forest)', width: '48px', height: '48px' }}>
                    <Users size={24} />
                  </div>
                  <h3>No passenger users found</h3>
                  <p>All current users may already be assigned roles or search returned no results.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Passenger Name</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th>Joined</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const uid = u._id || u.id
                      return (
                        <tr key={uid}>
                          <td>
                            <div className="td-name">
                              <div className="user-avatar" style={{ background: '#3b82f6' }}>
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <strong>{u.name}</strong>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span className="badge badge-blue">Passenger</span>
                          </td>
                          <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="button button-secondary"
                                style={{ padding: '7px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => handleMakeDriver(u)}
                              >
                                <UserPlus size={16} /> Make Driver
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BUS INFOS (Manager can add, update, manage buses)    */}
        {/* ========================================================= */}
        {activeTab === 'bus-infos' && (
          <div>
            <div className="content-header">
              <div>
                <h2>Campus Bus Informations</h2>
                <p className="content-subtitle">
                  Add, update, and manage all campus buses and their basic operational specifications.
                </p>
              </div>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  resetBusForm()
                  setShowBusModal(true)
                }}
              >
                <Plus size={16} style={{ marginRight: '6px' }} /> Add Campus Bus
              </button>
            </div>

            <div className="filter-bar">
              <div className="search-box">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search buses by number, name, or license plate..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrap">
              {loading ? (
                <div className="loading-screen">
                  <div className="spinner" />
                  <p>Loading bus fleet...</p>
                </div>
              ) : buses.length === 0 ? (
                <div className="empty-state">
                  <div className="stat-icon" style={{ margin: '0 auto 12px', background: 'rgba(31, 89, 73, 0.1)', color: 'var(--forest)', width: '48px', height: '48px' }}>
                    <Bus size={24} />
                  </div>
                  <h3>No campus buses found</h3>
                  <p>Click "Add Campus Bus" above to add your first bus to the system.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bus Number</th>
                      <th>Bus Model / Name</th>
                      <th>License Plate</th>
                      <th>Seating Capacity</th>
                      <th>Operational Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map((bus) => {
                      const bid = bus._id || bus.id
                      return (
                        <tr key={bid}>
                          <td>
                            <span className="bus-number-badge">#{bus.busNumber}</span>
                          </td>
                          <td>
                            <strong>{bus.name}</strong>
                          </td>
                          <td>{bus.licensePlate}</td>
                          <td>
                            <strong>{bus.capacity}</strong> seats
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                bus.status === 'active'
                                  ? 'badge-green'
                                  : bus.status === 'maintenance'
                                  ? 'badge-amber'
                                  : 'badge-red'
                              }`}
                            >
                              {bus.status}
                            </span>
                          </td>
                          <td>
                            <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="action-btn"
                                title="Edit Bus Details"
                                onClick={() => startEditBus(bus)}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                className="action-btn btn-delete"
                                title="Delete Bus"
                                onClick={() => handleDeleteBus(bus)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DRIVER ASSIGN (Assign drivers to buses & routes)   */}
        {/* ========================================================= */}
        {activeTab === 'driver-assign' && (
          <div>
            <div className="content-header">
              <div>
                <h2>Driver & Route Assignments</h2>
                <p className="content-subtitle">
                  Assign licensed drivers to specific campus buses and map buses to transportation routes.
                </p>
              </div>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  resetRouteForm()
                  setShowRouteModal(true)
                }}
              >
                <Plus size={16} style={{ marginRight: '6px' }} /> Create New Route
              </button>
            </div>

            <div className="filter-bar">
              <div className="search-box">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search buses to assign drivers or routes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrap">
              {buses.length === 0 ? (
                <div className="empty-state">
                  <div className="stat-icon" style={{ margin: '0 auto 12px', background: 'rgba(31, 89, 73, 0.1)', color: 'var(--forest)', width: '48px', height: '48px' }}>
                    <Bus size={24} />
                  </div>
                  <h3>No campus buses available</h3>
                  <p>Add buses in the "Bus Infos" tab first before assigning drivers and routes.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bus Information</th>
                      <th>Status</th>
                      <th>Assigned Driver</th>
                      <th>Assigned Route</th>
                      <th style={{ textAlign: 'right' }}>Assignment Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map((bus) => {
                      const bid = bus._id || bus.id
                      return (
                        <tr key={bid}>
                          {/* Bus Info */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="bus-number-badge">#{bus.busNumber}</span>
                                <strong style={{ fontSize: '15px' }}>{bus.name}</strong>
                              </div>
                              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                Plate: {bus.licensePlate} • Capacity: {bus.capacity} seats
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td>
                            <span
                              className={`badge ${
                                bus.status === 'active'
                                  ? 'badge-green'
                                  : bus.status === 'maintenance'
                                  ? 'badge-amber'
                                  : 'badge-red'
                              }`}
                            >
                              {bus.status}
                            </span>
                          </td>

                          {/* Driver */}
                          <td>
                            {bus.assignedDriver ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                  className="user-avatar"
                                  style={{ background: '#f59e0b', width: 28, height: 28, fontSize: 12 }}
                                >
                                  {bus.assignedDriver.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong style={{ fontSize: '13px', display: 'block' }}>
                                    {bus.assignedDriver.name}
                                  </strong>
                                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                    {bus.assignedDriver.email}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic' }}>
                                No driver assigned
                              </span>
                            )}
                          </td>

                          {/* Route */}
                          <td>
                            {bus.assignedRoute ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--forest)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                  <Route size={13} /> {bus.assignedRoute.routeName}
                                </strong>
                                <span style={{ fontSize: '12px', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                  {bus.assignedRoute.startPoint} <ArrowRight size={12} /> {bus.assignedRoute.endPoint}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic' }}>
                                No route assigned
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="actions-cell" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                type="button"
                                className="button button-secondary"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                                onClick={() => {
                                  setAssignDriverModal(bus)
                                  setSelectedDriverId(bus.assignedDriver?._id || bus.assignedDriver?.id || '')
                                }}
                              >
                                <User size={13} /> {bus.assignedDriver ? 'Change Driver' : 'Assign Driver'}
                              </button>
                              <button
                                type="button"
                                className="button button-secondary"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                                onClick={() => {
                                  setAssignRouteModal(bus)
                                  setSelectedRouteId(bus.assignedRoute?._id || bus.assignedRoute?.id || '')
                                }}
                              >
                                <Route size={13} /> {bus.assignedRoute ? 'Change Route' : 'Assign Route'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Configured Routes Sub-section */}
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '14px' }}>Configured Campus Routes ({routes.length})</h3>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Route Name</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Stops</th>
                      <th>Departures</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((r) => (
                      <tr key={r._id || r.id}>
                        <td>
                          <strong>{r.routeName}</strong>
                        </td>
                        <td>{r.startPoint}</td>
                        <td>{r.endPoint}</td>
                        <td>{r.stops?.join(', ') || 'Direct'}</td>
                        <td>{r.scheduleTimes?.join(', ') || 'Flexible'}</td>
                        <td>
                          <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button type="button" className="action-btn" onClick={() => startEditRoute(r)}>
                              <HiPencil />
                            </button>
                            <button
                              type="button"
                              className="action-btn btn-delete"
                              onClick={() => handleDeleteRoute(r)}
                            >
                              <HiTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD / EDIT BUS                                     */}
        {/* ========================================================= */}
        {showBusModal && (
          <div className="modal-backdrop" onClick={() => setShowBusModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingBus ? 'Edit Bus Information' : 'Add New Campus Bus'}</h3>
                <button type="button" className="btn-close" onClick={() => setShowBusModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <form className="modal-form" onSubmit={handleBusSubmit}>
                <label>
                  Bus Identification Number *
                  <input
                    type="text"
                    placeholder="e.g. BUS-101"
                    value={busForm.busNumber}
                    onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Bus Model / Name *
                  <input
                    type="text"
                    placeholder="e.g. Scania City Express"
                    value={busForm.name}
                    onChange={(e) => setBusForm({ ...busForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  License Plate *
                  <input
                    type="text"
                    placeholder="e.g. DHA-GA-9876"
                    value={busForm.licensePlate}
                    onChange={(e) => setBusForm({ ...busForm, licensePlate: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Seating Capacity *
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 45"
                    value={busForm.capacity}
                    onChange={(e) => setBusForm({ ...busForm, capacity: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Operational Status
                  <select
                    value={busForm.status}
                    onChange={(e) => setBusForm({ ...busForm, status: e.target.value })}
                  >
                    {BUS_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="modal-actions">
                  <button type="button" className="button button-secondary" onClick={() => setShowBusModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary">
                    {editingBus ? 'Save Changes' : 'Create Bus'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ASSIGN DRIVER TO BUS                               */}
        {/* ========================================================= */}
        {assignDriverModal && (
          <div className="modal-backdrop" onClick={() => setAssignDriverModal(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Assign Driver: {assignDriverModal.name}</h3>
                <button type="button" className="btn-close" onClick={() => setAssignDriverModal(null)}>
                  <X size={18} />
                </button>
              </div>
              <form className="modal-form" onSubmit={handleAssignDriver}>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
                  Select a certified driver from the campus fleet pool to operate bus #{assignDriverModal.busNumber}.
                </p>
                <label>
                  Select Driver
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                  >
                    <option value="">-- No Driver (Unassigned) --</option>
                    {drivers.map((d) => (
                      <option key={d._id || d.id} value={d._id || d.id}>
                        {d.name} ({d.email})
                      </option>
                    ))}
                  </select>
                </label>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setAssignDriverModal(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary">
                    Save Driver Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ASSIGN ROUTE TO BUS                                */}
        {/* ========================================================= */}
        {assignRouteModal && (
          <div className="modal-backdrop" onClick={() => setAssignRouteModal(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Assign Route: {assignRouteModal.name}</h3>
                <button type="button" className="btn-close" onClick={() => setAssignRouteModal(null)}>
                  <X size={18} />
                </button>
              </div>
              <form className="modal-form" onSubmit={handleAssignRoute}>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
                  Select the transportation route to map onto bus #{assignRouteModal.busNumber}.
                </p>
                <label>
                  Select Campus Route
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                  >
                    <option value="">-- No Route (Unassigned) --</option>
                    {routes.map((r) => (
                      <option key={r._id || r.id} value={r._id || r.id}>
                        {r.routeName} ({r.startPoint} → {r.endPoint})
                      </option>
                    ))}
                  </select>
                </label>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setAssignRouteModal(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary">
                    Save Route Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD / EDIT ROUTE                                   */}
        {/* ========================================================= */}
        {showRouteModal && (
          <div className="modal-backdrop" onClick={() => setShowRouteModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingRoute ? 'Edit Route' : 'Create New Route'}</h3>
                <button type="button" className="btn-close" onClick={() => setShowRouteModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <form className="modal-form" onSubmit={handleRouteSubmit}>
                <label>
                  Route Name *
                  <input
                    type="text"
                    placeholder="e.g. North Campus Express"
                    value={routeForm.routeName}
                    onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Start Location / Origin *
                  <input
                    type="text"
                    placeholder="e.g. Main Gate"
                    value={routeForm.startPoint}
                    onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                    required
                  />
                </label>
                <label>
                  End Location / Destination *
                  <input
                    type="text"
                    placeholder="e.g. Science Complex"
                    value={routeForm.endPoint}
                    onChange={(e) => setRouteForm({ ...routeForm, endPoint: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Intermediate Stops (comma-separated)
                  <input
                    type="text"
                    placeholder="e.g. Library, Dorm 3, Cafeteria"
                    value={routeForm.stops}
                    onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })}
                  />
                </label>
                <label>
                  Departure Schedules (comma-separated)
                  <input
                    type="text"
                    placeholder="e.g. 08:30 AM, 12:00 PM, 04:30 PM"
                    value={routeForm.scheduleTimes}
                    onChange={(e) => setRouteForm({ ...routeForm, scheduleTimes: e.target.value })}
                  />
                </label>
                <div className="modal-actions">
                  <button type="button" className="button button-secondary" onClick={() => setShowRouteModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary">
                    {editingRoute ? 'Save Route' : 'Create Route'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
