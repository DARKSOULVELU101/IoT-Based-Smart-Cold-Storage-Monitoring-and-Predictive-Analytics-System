import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cold-storage-auth')
    if (token) {
      try {
        const parsed = JSON.parse(token)
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`
        }
      } catch {
        // ignore
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cold-storage-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface Device {
  id: number
  name: string
  zone: string
  status: 'online' | 'offline' | 'disabled'
  temperature: number
  humidity: number
  risk_score: number
  compressor_current: number
  door_status: 'open' | 'closed'
  gas_level: number
  power_status: 'on' | 'off'
  last_reading_time: string
  created_at: string
  updated_at: string
}

export interface Reading {
  id: number
  device_id: number
  device_name: string
  zone: string
  temperature: number
  humidity: number
  compressor_current: number
  door_status: string
  gas_level: number
  power_status: string
  risk_score: number
  timestamp: string
}

export interface Alert {
  id: number
  device_id: number
  device_name: string
  zone: string
  alert_type: string
  level: 'info' | 'warning' | 'critical'
  message: string
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

export interface AlertStats {
  total: number
  active: number
  resolved: number
  by_level: Record<string, number>
  by_type: Record<string, number>
}

export interface AnalyticsData {
  temperature_stats: { avg: number; min: number; max: number; std_dev: number }
  humidity_stats: { avg: number; min: number; max: number; std_dev: number }
  risk_stats: { avg: number; min: number; max: number }
  door_events: number
  compressor_hours: number
  energy_consumption: number
  readings_count: number
  zone_scores: Record<string, number>
  hourly_temperature: Array<{ hour: string; avg_temp: number; min_temp: number; max_temp: number }>
  hourly_humidity: Array<{ hour: string; avg_humidity: number }>
}

export interface DashboardSummary {
  total_devices: number
  online_devices: number
  offline_devices: number
  avg_temperature: number
  avg_humidity: number
  active_alerts: number
  avg_risk_score: number
  system_status: string
  recent_readings: Reading[]
  active_alerts_list: Alert[]
  zone_summary: Record<string, { avg_temp: number; avg_humidity: number; device_count: number; avg_risk: number }>
  temp_trend: Array<{ time: string; temperature: number }>
  humidity_trend: Array<{ time: string; humidity: number }>
  risk_trend: Array<{ time: string; risk: number }>
}

export interface ZoneComparison {
  zones: Array<{
    zone: string
    avg_temperature: number
    avg_humidity: number
    avg_risk: number
    device_count: number
    online_count: number
    gas_level: number
    compressor_avg: number
    door_events: number
    power_status: string
  }>
  comparison_metrics: Array<{ metric: string; dairy: number; medicine: number; vegetable: number }>
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Report {
  id: number
  type: string
  generated_at: string
  status: string
  data?: Record<string, unknown>
}

export interface Prediction {
  timestamp: string
  predicted_temperature: number
  predicted_humidity: number
  predicted_risk: number
  confidence: number
}

// Auth APIs
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }),
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
}

// Device APIs
export const deviceAPI = {
  getAll: () => api.get<Device[]>('/devices'),
  getById: (id: number) => api.get<Device>(`/devices/${id}`),
  create: (data: Partial<Device>) => api.post<Device>('/devices', data),
  update: (id: number, data: Partial<Device>) => api.put<Device>(`/devices/${id}`, data),
  delete: (id: number) => api.delete(`/devices/${id}`),
  disable: (id: number) => api.patch(`/devices/${id}/disable`),
  enable: (id: number) => api.patch(`/devices/${id}/enable`),
}

// Reading APIs
export const readingAPI = {
  getAll: (params?: { device_id?: number; limit?: number; offset?: number }) =>
    api.get<Reading[]>('/readings', { params }),
  getLatest: (limit?: number) =>
    api.get<Reading[]>('/readings/latest', { params: { limit } }),
  getByDevice: (deviceId: number, limit?: number) =>
    api.get<Reading[]>(`/readings/device/${deviceId}`, { params: { limit } }),
}

// Analytics APIs
export const analyticsAPI = {
  get: (params?: { device_id?: number; zone?: string; hours?: number }) =>
    api.get<AnalyticsData>('/analytics', { params }),
  getPredictions: (params?: { device_id?: number; hours?: number }) =>
    api.get<Prediction[]>('/analytics/predictions', { params }),
}

// Dashboard API
export const dashboardAPI = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
}

// Zone API
export const zoneAPI = {
  getComparison: () => api.get<ZoneComparison>('/zones/comparison'),
}

// Alert APIs
export const alertAPI = {
  getAll: (params?: { level?: string; resolved?: boolean; device_id?: number }) =>
    api.get<Alert[]>('/alerts', { params }),
  getActive: () => api.get<Alert[]>('/alerts/active'),
  resolve: (id: number) => api.patch<Alert>(`/alerts/${id}/resolve`),
  getStats: () => api.get<AlertStats>('/alerts/stats'),
}

// Report APIs
export const reportAPI = {
  getAll: () => api.get<Report[]>('/reports'),
  generate: (data: { type: string; start_date: string; end_date: string; device_id?: number }) =>
    api.post<Report>('/reports/generate', data),
  getById: (id: number) => api.get<Report>(`/reports/${id}`),
  download: (id: number) =>
    api.get(`/reports/${id}/download`, { responseType: 'blob' }),
}

// Export API
export const exportAPI = {
  excel: (params?: { type?: string; start_date?: string; end_date?: string }) =>
    api.get('/export/excel', { params, responseType: 'blob' }),
}

export default api
