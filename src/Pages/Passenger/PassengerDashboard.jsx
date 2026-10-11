import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../Hooks/useAuth'
import apiClient from '../../Hooks/Axios'
import toast from 'react-hot-toast'
import { Search, Bus, Route, Clock, MapPin, User, ArrowRight } from 'lucide-react'

export default function PassengerDashboard() {
  const { user } = useAuth()
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('buses')

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
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dash-title">Passenger Portal</h1>
          <p className="dash-subtitle">Welcome, {user?.name || 'Passenger'}! Explore campus bus schedules and live routes.</p>
        </div>
        <div className="profile-pill">
          <span className="user-avatar" style={{ background: '#3b82f6' }}>
            {user?.name?.charAt(0).toUpperCase() || 'P'}
          </span>
          <div className="pill-info">
            <strong>{user?.name}</strong>
            <span className="badge badge-blue">Passenger</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
            <Bus size={24} />
          </div>
          <div>
            <div className="stat-value">{buses.filter((b) => b.status === 'active').length}</div>
            <div className="stat-label">Active Buses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <Route size={24} />
          </div>
          <div>
            <div className="stat-value">{routes.length}</div>
            <div className="stat-label">Campus Routes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{buses.length}</div>
            <div className="stat-label">Total Fleet</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'buses' ? 'active' : ''}`}
          onClick={() => setActiveTab('buses')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Bus size={16} /> Available Buses ({filteredBuses.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Route size={16} /> Campus Routes ({filteredRoutes.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder={activeTab === 'buses' ? 'Search buses by number, name, or route...' : 'Search routes by name or stop...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {activeTab === 'buses' && (
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="maintenance">In Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <p>Loading campus transit information...</p>
        </div>
      ) : activeTab === 'buses' ? (
        filteredBuses.length === 0 ? (
          <div className="empty-state">
            <div className="stat-icon" style={{ margin: '0 auto 12px', background: 'rgba(31, 89, 73, 0.1)', color: 'var(--forest)', width: '48px', height: '48px' }}>
              <Bus size={24} />
            </div>
            <h3>No buses found</h3>
            <p>Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="card-grid">
            {filteredBuses.map((bus) => (
              <div key={bus._id || bus.id} className="info-card">
                <div className="info-card-header">
                  <div className="bus-title-group">
                    <span className="bus-number-badge">#{bus.busNumber}</span>
                    <h3 className="card-heading">{bus.name}</h3>
                  </div>
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
                </div>

                <div className="info-card-body">
                  <div className="info-row">
                    <span>License Plate</span>
                    <strong>{bus.licensePlate}</strong>
                  </div>
                  <div className="info-row">
                    <span>Capacity</span>
                    <strong>{bus.capacity} seats</strong>
                  </div>

                  {bus.assignedRoute ? (
                    <div className="route-highlight-box">
                      <div className="route-name-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Route size={14} className="inline-icon" /> {bus.assignedRoute.routeName}
                      </div>
                      <div className="route-points">
                        <span className="point start">{bus.assignedRoute.startPoint}</span>
                        <span className="route-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <ArrowRight size={13} />
                        </span>
                        <span className="point end">{bus.assignedRoute.endPoint}</span>
                      </div>
                      {bus.assignedRoute.stops?.length > 0 && (
                        <div className="route-stops-taglist">
                          {bus.assignedRoute.stops.map((stop, idx) => (
                            <span key={idx} className="stop-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={11} className="mini-icon" /> {stop}
                            </span>
                          ))}
                        </div>
                      )}
                      {bus.assignedRoute.scheduleTimes?.length > 0 && (
                        <div className="schedule-pills">
                          <Clock size={13} className="inline-icon" /> Schedules:
                          {bus.assignedRoute.scheduleTimes.map((t, idx) => (
                            <span key={idx} className="time-pill">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="unassigned-note">
                      <span>Route: Unassigned</span>
                    </div>
                  )}

                  <div className="driver-info-box" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} className="inline-icon" />
                    {bus.assignedDriver ? (
                      <span>
                        Driver: <strong>{bus.assignedDriver.name}</strong> ({bus.assignedDriver.email})
                      </span>
                    ) : (
                      <span className="muted-text">Driver: Not assigned yet</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Routes Tab */
        filteredRoutes.length === 0 ? (
          <div className="empty-state">
            <div className="stat-icon" style={{ margin: '0 auto 12px', background: 'rgba(31, 89, 73, 0.1)', color: 'var(--forest)', width: '48px', height: '48px' }}>
              <Route size={24} />
            </div>
            <h3>No routes found</h3>
            <p>Try searching for a different destination or campus location.</p>
          </div>
        ) : (
          <div className="card-grid">
            {filteredRoutes.map((route) => (
              <div key={route._id || route.id} className="info-card">
                <div className="info-card-header">
                  <div className="route-title-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="route-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--forest)' }}>
                      <Route size={18} />
                    </span>
                    <h3 className="card-heading">{route.routeName}</h3>
                  </div>
                  <span className={`badge ${route.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                    {route.status}
                  </span>
                </div>

                <div className="info-card-body">
                  <div className="route-points-banner">
                    <div className="point-item">
                      <span className="point-label">From</span>
                      <strong className="point-value">{route.startPoint}</strong>
                    </div>
                    <span className="route-arrow-lg" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <ArrowRight size={18} />
                    </span>
                    <div className="point-item">
                      <span className="point-label">To</span>
                      <strong className="point-value">{route.endPoint}</strong>
                    </div>
                  </div>

                  {route.stops?.length > 0 && (
                    <div className="section-subblock">
                      <label className="subblock-label">Stops ({route.stops.length})</label>
                      <div className="route-stops-taglist">
                        {route.stops.map((stop, idx) => (
                          <span key={idx} className="stop-pill">
                            <span className="stop-number">{idx + 1}</span> {stop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {route.scheduleTimes?.length > 0 && (
                    <div className="section-subblock">
                      <label className="subblock-label">Scheduled Departures</label>
                      <div className="schedule-pills">
                        {route.scheduleTimes.map((t, idx) => (
                          <span key={idx} className="time-pill">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
