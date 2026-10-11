import { createBrowserRouter } from 'react-router'
import Root from '../Root'
import Home from '../Pages/Home'
import Login from '../Pages/Login'
import Signup from '../Pages/Signup'
import ProtectedRoute from '../Components/ProtectedRoute'
import DashboardRedirect from '../Components/DashboardRedirect'
import AdminDashboard from '../Pages/Admin/AdminDashboard'
import ManagerDashboard from '../Pages/Manager/ManagerDashboard'
import DriverDashboard from '../Pages/Driver/DriverDashboard'
import PassengerDashboard from '../Pages/Passenger/PassengerDashboard'

const routes = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
    ],
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'signup',
    element: <Signup />,
  },
  {
    path: 'dashboard',
    element: <DashboardRedirect />,
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'manager',
    element: (
      <ProtectedRoute allowedRoles={['transportation-manager', 'admin']}>
        <ManagerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'driver',
    element: (
      <ProtectedRoute allowedRoles={['driver', 'admin']}>
        <DriverDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'passenger',
    element: (
      <ProtectedRoute allowedRoles={['user', 'admin']}>
        <PassengerDashboard />
      </ProtectedRoute>
    ),
  },
])

export default routes
