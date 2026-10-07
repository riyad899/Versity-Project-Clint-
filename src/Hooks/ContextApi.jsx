import { useState } from 'react'
import apiClient from './Axios'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => {
		const savedUser = localStorage.getItem('auth-user')
		return savedUser ? JSON.parse(savedUser) : null
	})

	const login = async (credentials) => {
		const response = await apiClient.post('/api/v1/admin/login', credentials)
		const account = response.data?.data || response.data?.user || response.data
		const token = response.data?.token || response.data?.data?.token || response.data?.accessToken

		if (token) {
			localStorage.setItem('auth-token', token)
		}
		setUser(account)
		localStorage.setItem('auth-user', JSON.stringify(account))
		return response.data
	}

	const logout = () => {
		localStorage.removeItem('auth-token')
		localStorage.removeItem('auth-user')
		setUser(null)
	}

	return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

