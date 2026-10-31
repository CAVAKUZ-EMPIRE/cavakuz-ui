import axios, { type AxiosError } from 'axios'

const TOKEN_KEY = 'cavakuz-token'
const USER_KEY = 'cavakuz-user'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

export const storage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string, persist: boolean) {
    sessionStorage.setItem(TOKEN_KEY, token)
    if (persist) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
  setUser(user: unknown, persist: boolean) {
    const value = JSON.stringify(user)
    sessionStorage.setItem(USER_KEY, value)
    if (persist) {
      localStorage.setItem(USER_KEY, value)
    } else {
      localStorage.removeItem(USER_KEY)
    }
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem('cavakuz-role')
    localStorage.removeItem('cavakuz-role')
  },
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = storage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    if (status === 401 && !url.includes('/login')) {
      storage.clear()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export default api
