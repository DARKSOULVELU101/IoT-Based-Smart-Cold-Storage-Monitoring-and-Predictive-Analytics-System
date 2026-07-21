import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, token, isAuthenticated, login: storeLogin, logout: storeLogout, setUser } = useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.auth.login(email, password)
    storeLogin(data.user, data.access_token)
    navigate('/')
    return data
  }, [storeLogin, navigate])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await apiClient.auth.register(name, email, password)
    storeLogin(data.user, data.access_token)
    navigate('/')
    return data
  }, [storeLogin, navigate])

  const logout = useCallback(() => {
    storeLogout()
    navigate('/login')
  }, [storeLogout, navigate])

  const fetchProfile = useCallback(async () => {
    const { data } = await apiClient.auth.getProfile()
    setUser(data)
    return data
  }, [setUser])

  return { user, token, isAuthenticated, login, register, logout, fetchProfile }
}
