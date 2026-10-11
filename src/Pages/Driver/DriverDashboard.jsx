import { useState, useEffect } from 'react'
import { useAuth } from '../../Hooks/useAuth'
import apiClient from '../../Hooks/Axios'
import toast from 'react-hot-toast'
import { Bus, Route, Clock, Search, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react'

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
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">
            <Bus size={20} />
          </span>
          <div>
            <h3>Driver Portal</h3>
            <p>Campus Operations</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'bus-infos' ? 'active' : ''}`}
            onClick={() => setActiveTab('bus-infos')}
          >
            <Bus className="sidebar-icon" size={18} />
            <span>Bus Infos</span>
            <span className="sidebar-counter">{buses.length}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'my-buses' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-buses')}
          >
            <UserCheck className="sidebar-icon" size={18} />
            <span>My Assigned Buses</span>
            <span className="sidebar-counter">{myBuses.length}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-pill">
            <div className="user-avatar" style={{ background: '#f59e0b' }}>
              {user?.name?.charAt(0).toUpperCase() || 'D'}
            </div>
            <div className="sidebar-user-text">
              <strong>{user?.name || 'Driver'}</strong>
              <span className="badge badge-amber">Driver</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <div className="content-header">
          <div>
            <h2>
              {activeTab === 'my-buses'
                ? 'My Assigned Campus Buses'
                : 'Campus Bus Fleet Information'}
            </h2>
            <p className="content-subtitle">
              {activeTab === 'my-buses'
                ? 'Buses and routes specifically assigned to you by the transportation manager.'
                : 'View-only list of campus bus details, schedules, and active routes added by management.'}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search buses by number, model name, or route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Fleet Cards Grid */}
        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p>Loading bus information...</p>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="empty-state">
            <div className="stat-icon" style={{ margin: '0 auto 12px', background: 'rgba(31, 89, 73, 0.1)', color: 'var(--forest)', width: '48px', height: '48px' }}>
              <Bus size={24} />
            </div>
            <h3>
              {activeTab === 'my-buses'
                ? 'No buses currently assigned to you'
                : 'No campus buses found'}
            </h3>
            <p>
              {activeTab === 'my-buses'
                ? 'Your transportation manager has not assigned any bus to your account yet.'
                : 'Try adjusting your search query.'}
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {filteredBuses.map((bus) => {
              const isAssignedToMe =
                (bus.assignedDriver?._id || bus.assignedDriver?.id || bus.assignedDriver) === driverId

              return (
                <div
                  key={bus._id || bus.id}
                  className="info-card"
                  style={isAssignedToMe ? { border: '2px solid var(--forest)' } : {}}
                >
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

                    {isAssignedToMe && (
                      <div style={{ margin: '4px 0' }}>
                        <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> Assigned to You
                        </span>
                      </div>
                    )}

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
                              <span key={idx} className="stop-pill">
                                {stop}
                              </span>
                            ))}
                          </div>
                        )}
                        {bus.assignedRoute.scheduleTimes?.length > 0 && (
                          <div className="schedule-pills">
                            <Clock size={13} className="inline-icon" /> Schedules:
                            {bus.assignedRoute.scheduleTimes.map((t, idx) => (
                              <span key={idx} className="time-pill">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="unassigned-note">
                        <span>Route: Not assigned yet</span>
                      </div>
                    )}

                    <div className="driver-info-box">
                      <span className="muted-text">
                        {bus.assignedDriver ? (
                          isAssignedToMe ? (
                            <strong style={{ color: 'var(--forest)' }}>You are driving this bus</strong>
                          ) : (
                            `Driver: ${bus.assignedDriver.name}`
                          )
                        ) : (
                          'Driver: Unassigned'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
