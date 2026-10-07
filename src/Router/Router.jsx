import { createBrowserRouter } from 'react-router'
import Root from '../Root'
import Home from '../Pages/Home'
import Login from '../Pages/Login'
import Signup from '../Pages/Signup'

const routes = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            { index: true, element: <Home /> },
            { path: 'login', element: <Login /> },
            { path: 'signup', element: <Signup /> },
        ],
    },
])

export default routes

