import { Outlet } from 'react-router'
import { Navbar } from './Pages/Navbar'
import { Footer } from './Pages/Footer'

const Root = () => {
    return (
        <div className="site-shell">
            <Navbar />
            <main className="site-main">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Root
