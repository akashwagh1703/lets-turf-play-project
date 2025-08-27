import axios from 'axios'
import { getSession } from './authService.js'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  timeout: 10000
})

http.interceptors.request.use((config) => {
  const session = getSession()
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  // Example security headers
  config.headers['X-Requested-With'] = 'XMLHttpRequest'
  return config
})

export default http
