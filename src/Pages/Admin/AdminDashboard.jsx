import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../Hooks/Axios'
import toast from 'react-hot-toast'
import {
  Users,
  Bus,
  ShieldCheck,
  Search,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  LayoutDashboard,
  Route,
  X,
} from 'lucide-react'
import { useAuth } from '../../Hooks/useAuth'

const ROLE_OPTIONS = ['user', 'driver', 'transportation-manager', 'admin']
const ROLE_LABELS = {
  user: 'Passenger',
  driver: 'Driver',
  'transportation-manager': 'Transport Manager',
  admin: 'Admin',
}
const ROLE_COLORS = {
  user: '#3b82f6',
  driver: '#f59e0b',
  'transportation-manager': '#10b981',
  admin: '#ef4444',
}

export default function AdminDashboard() {
  const { user: currentAuthUser } = useAuth()
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'overview'
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState({ role: '', search: '' })
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', role: '' })

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/admin/stats')
      setStats(res.data?.data)
    } catch {
      // ignore
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const params = {}
      if (filter.role) params.role = filter.role
      if (filter.search) params.search = filter.search
      const res = await apiClient.get('/api/v1/admin/users', { params })
      setUsers(res.data?.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }, [filter])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleChangeRole = async (userId, newRole) => {
    try {
      await apiClient.patch(`/api/v1/admin/users/${userId}/role`, { role: newRole })
      toast.success(`Role updated to ${ROLE_LABELS[newRole]}`)
      fetchUsers()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role')
    }
  }

  const handleToggleBan = async (user) => {
    const isBanning = !user.banned
    const reason = isBanning
      ? prompt('Enter ban reason (optional):', 'Violation of terms') || 'Violation of terms'
      : ''
    if (isBanning && reason === null) return

    try {
      await apiClient.patch(`/api/v1/admin/users/${user._id || user.id}/ban`, {
        banned: isBanning,
        banReason: reason,
      })
      toast.success(isBanning ? 'User banned successfully' : 'User unbanned successfully')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ban status')
    }
  }

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete "${user.name}"? This cannot be undone.`)) {
      return
    }
    try {
      await apiClient.delete(`/api/v1/admin/users/${user._id || user.id}`)
      toast.success('User deleted successfully')
      fetchUsers()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const startEdit = (user) => {
    setEditingUser(user)
    setEditForm({ name: user.name, role: user.role })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      const uid = editingUser._id || editingUser.id
      await apiClient.patch(`/api/v1/admin/users/${uid}`, { name: editForm.name })
      if (editForm.role !== editingUser.role) {
        await apiClient.patch(`/api/v1/admin/users/${uid}/role`, { role: editForm.role })
      }
      toast.success('User details updated')
      setEditingUser(null)
      fetchUsers()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes')
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h3>Admin Portal</h3>
            <p>System Management</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="sidebar-icon" size={18} />
            <span>Users</span>
            {stats?.accounts?.totalUsers !== undefined && (
              <span className="sidebar-counter">{stats.accounts.totalUsers}</span>
            )}
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard className="sidebar-icon" size={18} />
            <span>Overview & Stats</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-pill">
            <div className="user-avatar" style={{ background: '#ef4444' }}>
              {currentAuthUser?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="sidebar-user-text">
              <strong>{currentAuthUser?.name || 'Administrator'}</strong>
              <span className="badge badge-red">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="content-header">
              <div>
                <h2>User Account Management</h2>
                <p className="content-subtitle">
                  View, update roles, manage, ban, or remove passenger, driver, and manager accounts.
                </p>
              </div>
            </div>

            {/* Quick counters */}
            {stats?.accounts && (
              <div className="stats-grid stats-grid-compact">
                <div className="stat-card" onClick={() => setFilter({ ...filter, role: 'user' })} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.accounts.passengers}</div>
                    <div className="stat-label">Passengers</div>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setFilter({ ...filter, role: 'driver' })} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                    <Bus size={20} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.accounts.drivers}</div>
                    <div className="stat-label">Drivers</div>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setFilter({ ...filter, role: 'transportation-manager' })} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                    <Route size={20} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.accounts.transportationManagers}</div>
                    <div className="stat-label">Transport Managers</div>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setFilter({ ...filter, role: 'admin' })} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.accounts.admins}</div>
                    <div className="stat-label">Admins</div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="filter-bar">
              <div className="search-box">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </div>

              <select
                value={filter.role}
                onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                className="filter-select"
              >
                <option value="">All Account Roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            {/* Users Table */}
            <div className="table-wrap">
              {loadingUsers ? (
                <div className="loading-screen">
                  <div className="spinner" />
                  <p>Loading accounts...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <div className="stat-icon" style={{ margin: '0 auto 12px', background: 'rgba(31, 89, 73, 0.1)', color: 'var(--forest)', width: '48px', height: '48px' }}>
                    <Users size={24} />
                  </div>
                  <h3>No accounts found</h3>
                  <p>No user accounts matched your current search filters.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const uid = u._id || u.id
                      return (
                        <tr key={uid} className={u.banned ? 'row-banned' : ''}>
                          <td>
                            <div className="td-name">
                              <div className="user-avatar" style={{ background: ROLE_COLORS[u.role] || '#6b7280' }}>
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <strong>{u.name}</strong>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <select
                              className="inline-select"
                              value={u.role}
                              onChange={(e) => handleChangeRole(uid, e.target.value)}
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            {u.banned ? (
                              <span className="badge badge-red" title={u.banReason || 'Banned'} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Ban size={12} /> Banned
                              </span>
                            ) : (
                              <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={12} /> Active
                              </span>
                            )}
                          </td>
                          <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="action-btn"
                                title="Edit Name & Role"
                                onClick={() => startEdit(u)}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                className={`action-btn ${u.banned ? 'btn-unban' : 'btn-ban'}`}
                                title={u.banned ? 'Unban User' : 'Ban User'}
                                onClick={() => handleToggleBan(u)}
                              >
                                {u.banned ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                              </button>
                              <button
                                type="button"
                                className="action-btn btn-delete"
                                title="Delete User Permanently"
                                onClick={() => handleDeleteUser(u)}
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

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div className="content-header">
              <div>
                <h2>System Overview</h2>
                <p className="content-subtitle">High-level statistics for users, fleet buses, and campus transit routes.</p>
              </div>
            </div>

            {stats && (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(31, 89, 73, 0.12)', color: 'var(--forest)' }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <div className="stat-value">{stats.accounts?.totalUsers || 0}</div>
                      <div className="stat-label">Total Registered Users</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                      <Bus size={24} />
                    </div>
                    <div>
                      <div className="stat-value">{stats.fleet?.totalBuses || 0}</div>
                      <div className="stat-label">Campus Buses</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                      <Route size={24} />
                    </div>
                    <div>
                      <div className="stat-value">{stats.fleet?.totalRoutes || 0}</div>
                      <div className="stat-label">Active Campus Routes</div>
                    </div>
                  </div>
                </div>

                <div className="card-grid" style={{ marginTop: '24px' }}>
                  <div className="info-card">
                    <div className="info-card-header">
                      <h3 className="card-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} /> Account Distribution
                      </h3>
                    </div>
                    <div className="info-card-body">
                      <div className="info-row">
                        <span>Passenger Accounts</span>
                        <strong>{stats.accounts?.passengers}</strong>
                      </div>
                      <div className="info-row">
                        <span>Driver Accounts</span>
                        <strong>{stats.accounts?.drivers}</strong>
                      </div>
                      <div className="info-row">
                        <span>Transportation Managers</span>
                        <strong>{stats.accounts?.transportationManagers}</strong>
                      </div>
                      <div className="info-row">
                        <span>System Administrators</span>
                        <strong>{stats.accounts?.admins}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-card-header">
                      <h3 className="card-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bus size={18} /> Transit Operations
                      </h3>
                    </div>
                    <div className="info-card-body">
                      <div className="info-row">
                        <span>Total Campus Buses</span>
                        <strong>{stats.fleet?.totalBuses}</strong>
                      </div>
                      <div className="info-row">
                        <span>Configured Routes</span>
                        <strong>{stats.fleet?.totalRoutes}</strong>
                      </div>
                      <div className="info-row">
                        <span>System Status</span>
                        <span className="badge badge-green">Operational</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit User Details</h3>
                <button type="button" className="btn-close" onClick={() => setEditingUser(null)}>
                  <X size={18} />
                </button>
              </div>
              <form className="modal-form" onSubmit={handleSaveEdit}>
                <label>
                  Full Name
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  System Role
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="modal-actions">
                  <button type="button" className="button button-secondary" onClick={() => setEditingUser(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary">
                    Save Changes
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
