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
  UserCheck,
} from 'lucide-react'
import { useAuth } from '../../Hooks/useAuth'
import DashboardShell from '@/Components/Dashboard/DashboardShell'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Input } from '@/Components/ui/input'
import MsgModal from '@/Components/MsgModal'

const ROLE_OPTIONS = ['user', 'driver', 'transportation-manager', 'admin']
const ROLE_LABELS = {
  user: 'Passenger',
  driver: 'Driver',
  'transportation-manager': 'Transport Manager',
  admin: 'Admin',
}
const ROLE_BADGE_VARIANTS = {
  user: 'softBlue',
  driver: 'softAmber',
  'transportation-manager': 'softGreen',
  admin: 'softRed',
}
const ROLE_BG = {
  user: 'bg-blue-600',
  driver: 'bg-amber-600',
  'transportation-manager': 'bg-emerald-600',
  admin: 'bg-rose-600',
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
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    user: null,
    isBanning: false,
    reason: '',
    loading: false,
  })

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

  const handleOpenStatusModal = (user) => {
    const isBanning = !user.banned
    setStatusModal({
      isOpen: true,
      user,
      isBanning,
      reason: isBanning ? (user.banReason || 'Violation of terms') : '',
      loading: false,
    })
  }

  const handleConfirmStatus = async () => {
    if (!statusModal.user) return
    setStatusModal((prev) => ({ ...prev, loading: true }))
    try {
      const user = statusModal.user
      const isBanning = statusModal.isBanning
      await apiClient.patch(`/api/v1/admin/users/${user._id || user.id}/ban`, {
        banned: isBanning,
        banReason: isBanning ? (statusModal.reason || 'Violation of terms') : '',
      })
      toast.success(
        isBanning
          ? `User "${user.name}" has been banned successfully`
          : `User "${user.name}" has been activated successfully`
      )
      setStatusModal({
        isOpen: false,
        user: null,
        isBanning: false,
        reason: '',
        loading: false,
      })
      fetchUsers()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status')
      setStatusModal((prev) => ({ ...prev, loading: false }))
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
    <DashboardShell
      roleTitle="Admin Portal"
      roleSubtitle="System Administration"
      roleBadge="Admin"
      roleBadgeVariant="softRed"
      portalIcon={ShieldCheck}
      navItems={[
        {
          id: 'users',
          label: 'User Accounts',
          icon: Users,
          badge: stats?.accounts?.totalUsers,
        },
        {
          id: 'overview',
          label: 'Overview & Stats',
          icon: LayoutDashboard,
        },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ======================= USERS TAB ======================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              User Account Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View, assign roles, monitor statuses, or ban/remove passenger, driver, and manager accounts.
            </p>
          </div>

          {/* Quick Counter Cards */}
          {stats?.accounts && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <Card
                onClick={() => setFilter({ ...filter, role: 'user' })}
                className="cursor-pointer border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-950">{stats.accounts.passengers}</div>
                    <div className="text-xs font-semibold text-slate-500">Passengers</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                onClick={() => setFilter({ ...filter, role: 'driver' })}
                className="cursor-pointer border-slate-200/80 hover:border-amber-400 hover:shadow-md transition-all"
              >
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-950">{stats.accounts.drivers}</div>
                    <div className="text-xs font-semibold text-slate-500">Drivers</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                onClick={() => setFilter({ ...filter, role: 'transportation-manager' })}
                className="cursor-pointer border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all"
              >
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Route className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-950">{stats.accounts.transportationManagers}</div>
                    <div className="text-xs font-semibold text-slate-500">Managers</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                onClick={() => setFilter({ ...filter, role: 'admin' })}
                className="cursor-pointer border-slate-200/80 hover:border-rose-400 hover:shadow-md transition-all"
              >
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-950">{stats.accounts.admins}</div>
                    <div className="text-xs font-semibold text-slate-500">Admins</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search accounts by name or email..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="pl-10 bg-white"
              />
            </div>

            <select
              value={filter.role}
              onChange={(e) => setFilter({ ...filter, role: e.target.value })}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-2xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Account Roles</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Users Table Card */}
          <Card className="border-slate-200/80 shadow-xs overflow-hidden">
            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="mt-3 text-sm font-medium">Loading user accounts...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No accounts found</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm">
                  No accounts matched your current search and role filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5">Account Name</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">System Role</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Joined</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {users.map((u) => {
                      const uid = u._id || u.id
                      return (
                        <tr
                          key={uid}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            u.banned ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white font-bold text-xs shadow-2xs ${
                                  ROLE_BG[u.role] || 'bg-slate-600'
                                }`}
                              >
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {u.name}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(uid, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(u)}
                              className="cursor-pointer transition-transform hover:scale-105 focus:outline-none"
                              title={`Click to ${u.banned ? 'activate' : 'ban'} user`}
                            >
                              {u.banned ? (
                                <Badge
                                  variant="softRed"
                                  title={u.banReason || 'Banned'}
                                  className="text-xs cursor-pointer"
                                >
                                  <Ban className="h-3 w-3 mr-1" /> Banned
                                </Badge>
                              ) : (
                                <Badge variant="softGreen" className="text-xs cursor-pointer">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                                </Badge>
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                title="Edit Name & Role"
                                onClick={() => startEdit(u)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${
                                  u.banned
                                    ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                    : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                }`}
                                title={u.banned ? 'Activate User' : 'Ban User'}
                                onClick={() => handleOpenStatusModal(u)}
                              >
                                {u.banned ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <Ban className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                title="Delete User Permanently"
                                onClick={() => handleDeleteUser(u)}
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

      {/* ======================= OVERVIEW TAB ======================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              System Overview & Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              High-level statistics for campus accounts, fleet vehicles, and transit routes.
            </p>
          </div>

          {stats && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border-slate-200/80 shadow-xs">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Registered Accounts
                      </p>
                      <h3 className="mt-2 text-3xl font-black text-slate-950">
                        {stats.accounts?.totalUsers || 0}
                      </h3>
                      <p className="mt-1 text-xs text-blue-600 font-semibold">Active campus members</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Users className="h-7 w-7" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Campus Buses
                      </p>
                      <h3 className="mt-2 text-3xl font-black text-slate-950">
                        {stats.fleet?.totalBuses || 0}
                      </h3>
                      <p className="mt-1 text-xs text-emerald-600 font-semibold">Configured fleet units</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Bus className="h-7 w-7" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Active Campus Routes
                      </p>
                      <h3 className="mt-2 text-3xl font-black text-slate-950">
                        {stats.fleet?.totalRoutes || 0}
                      </h3>
                      <p className="mt-1 text-xs text-amber-600 font-semibold">Scheduled transit paths</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <Route className="h-7 w-7" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-slate-200/80 shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" /> Account Distribution
                    </CardTitle>
                    <CardDescription>Breakdown of campus community by authorization role</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-600 font-medium">Passenger Accounts</span>
                      <strong className="text-slate-950 font-bold">{stats.accounts?.passengers || 0}</strong>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-600 font-medium">Driver Accounts</span>
                      <strong className="text-slate-950 font-bold">{stats.accounts?.drivers || 0}</strong>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-600 font-medium">Transportation Managers</span>
                      <strong className="text-slate-950 font-bold">{stats.accounts?.transportationManagers || 0}</strong>
                    </div>
                    <div className="flex items-center justify-between py-2 text-sm">
                      <span className="text-slate-600 font-medium">System Administrators</span>
                      <strong className="text-slate-950 font-bold">{stats.accounts?.admins || 0}</strong>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bus className="h-4 w-4 text-emerald-600" /> Transit Fleet Operations
                    </CardTitle>
                    <CardDescription>Current operational capacity and network coverage</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-600 font-medium">Total Registered Buses</span>
                      <strong className="text-slate-950 font-bold">{stats.fleet?.totalBuses || 0}</strong>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-600 font-medium">Configured Transit Routes</span>
                      <strong className="text-slate-950 font-bold">{stats.fleet?.totalRoutes || 0}</strong>
                    </div>
                    <div className="flex items-center justify-between py-2 text-sm">
                      <span className="text-slate-600 font-medium">Transit Network Status</span>
                      <Badge variant="softGreen" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Fully Operational
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* ======================= EDIT MODAL ======================= */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Edit User Details</h3>
                <p className="text-xs text-slate-500">Update account credentials or assigned role</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditingUser(null)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <Input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">System Role *</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Ban / Active Status Update Custom Modal */}
      <MsgModal
        isOpen={statusModal.isOpen}
        onClose={() =>
          setStatusModal({
            isOpen: false,
            user: null,
            isBanning: false,
            reason: '',
            loading: false,
          })
        }
        user={statusModal.user}
        actionType={statusModal.isBanning ? 'ban' : 'active'}
        reason={statusModal.reason}
        onReasonChange={(val) =>
          setStatusModal((prev) => ({ ...prev, reason: val }))
        }
        onConfirm={handleConfirmStatus}
        isLoading={statusModal.loading}
      />
    </DashboardShell>
  )
}
