import axios from 'axios'

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5009/',
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
})

// Attach bearer token from localStorage on every request
apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem('auth-token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

export default apiClient
