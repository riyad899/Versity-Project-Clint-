import { useState, useEffect, useCallback } from 'react'
import apiClient from './Axios'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => {
		const savedUser = localStorage.getItem('auth-user')
		return savedUser ? JSON.parse(savedUser) : null
	})
	const [loading, setLoading] = useState(true)

	// Persist user data whenever it changes
	useEffect(() => {
		if (user) {
			localStorage.setItem('auth-user', JSON.stringify(user))
		} else {
			localStorage.removeItem('auth-user')
		}
	}, [user])

	// Fetch current user session on mount
	useEffect(() => {
		const fetchSession = async () => {
			try {
				const token = localStorage.getItem('auth-token')
				if (!token && !document.cookie.includes('better-auth')) {
					setUser(null)
					localStorage.removeItem('auth-user')
					setLoading(false)
					return
				}
				const response = await apiClient.get('/api/v1/auth/me')
				if (response.data?.data) {
					setUser(response.data.data)
				} else {
					setUser(null)
					localStorage.removeItem('auth-user')
					localStorage.removeItem('auth-token')
				}
			} catch {
				// Session expired or invalid - clear completely so user cannot access dashboard
				localStorage.removeItem('auth-token')
				localStorage.removeItem('auth-user')
				setUser(null)
			} finally {
				setLoading(false)
			}
		}
		fetchSession()
	}, [])

	const signup = useCallback(async (data) => {
		// Clear previous session state
		setUser(null)
		localStorage.removeItem('auth-user')
		localStorage.removeItem('auth-token')

		const response = await apiClient.post('/api/v1/auth/register', data)
		const resData = response.data?.data || response.data
		const token = resData?.token || resData?.session?.token

		if (!token && !document.cookie.includes('better-auth')) {
			throw new Error(resData?.message || 'Registration failed.')
		}

		if (token) {
			localStorage.setItem('auth-token', token)
		}

		let activeUser = resData?.user || resData
		try {
			const profileRes = await apiClient.get('/api/v1/auth/me')
			if (profileRes.data?.data) {
				activeUser = profileRes.data.data
			}
		} catch {
			// keep activeUser
		}

		if (!activeUser || (!activeUser.id && !activeUser._id)) {
			throw new Error('Registration failed: Invalid user profile.')
		}

		setUser(activeUser)
		return activeUser
	}, [])

	const login = useCallback(async (credentials) => {
		// Clear previous session state so invalid logins never retain old credentials
		setUser(null)
		localStorage.removeItem('auth-user')
		localStorage.removeItem('auth-token')

		const response = await apiClient.post('/api/v1/auth/login', credentials)
		const resData = response.data?.data || response.data
		const token = resData?.token || resData?.session?.token

		if (!token && !document.cookie.includes('better-auth')) {
			throw new Error(resData?.message || 'Login failed. Invalid email or password.')
		}

		if (token) {
			localStorage.setItem('auth-token', token)
		}

		let activeUser = resData?.user || resData
		try {
			const profileRes = await apiClient.get('/api/v1/auth/me')
			if (profileRes.data?.data) {
				activeUser = profileRes.data.data
			}
		} catch {
			// keep activeUser
		}

		if (!activeUser || (!activeUser.id && !activeUser._id)) {
			throw new Error('Login failed: Invalid user profile received.')
		}

		if (activeUser.banned) {
			localStorage.removeItem('auth-token')
			localStorage.removeItem('auth-user')
			setUser(null)
			throw new Error(`Account is banned: ${activeUser.banReason || 'Contact support'}`)
		}

		setUser(activeUser)
		return activeUser
	}, [])

	const logout = useCallback(() => {
		localStorage.removeItem('auth-token')
		localStorage.removeItem('auth-user')
		setUser(null)
	}, [])

	const refreshUser = useCallback(async () => {
		try {
			const response = await apiClient.get('/api/v1/auth/me')
			if (response.data?.data) {
				setUser(response.data.data)
			}
		} catch {
			localStorage.removeItem('auth-token')
			localStorage.removeItem('auth-user')
			setUser(null)
		}
	}, [])

	return (
		<AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
			{children}
		</AuthContext.Provider>
	)
}
