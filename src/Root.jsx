import { Outlet } from 'react-router'
import { Navbar } from './Pages/Navbar'
import { Footer } from './Pages/Footer'
import { Toaster } from 'react-hot-toast'

const Root = () => {
  return (
    <div className="site-shell">
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Root
