import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'
import routes from './Router/Router'
import { AuthProvider } from './Hooks/ContextApi'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App>
      <AuthProvider>
        <RouterProvider router={routes} />
      </AuthProvider>
    </App>
  </React.StrictMode>,
)
