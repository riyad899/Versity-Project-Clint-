import { Outlet } from 'react-router'
import { Navbar } from './Pages/Navbar'
import { Footer } from './Pages/Footer'
const Root = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/40 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Root
