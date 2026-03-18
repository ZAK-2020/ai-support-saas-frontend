import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    // no active session
  }
  return config
})

// removed the 401 redirect — Clerk handles session expiry itself
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default api