import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export type ModuleType = 'cold-storage' | 'machine-health' | 'water-quality' | 'warehouse'

export interface Reading {
  deviceId: string
  zone: string
  temperature: number
  humidity: number
  doorOpen: boolean
  doorOpenSeconds: number
  gasLevel: number
  compressorCurrent: number
  compressorOn: boolean
  powerAvailable: boolean
  riskScore: number
  status: 'SAFE' | 'WARNING' | 'CRITICAL' | 'OFFLINE'
  timestamp?: string
  module?: ModuleType
}

export interface Device {
  id: string
  name: string
  zone: string
  type: string
  enabled: boolean
  online: boolean
  module: ModuleType
  lastHeartbeat: string
  createdAt: string
  updatedAt: string
  config?: Record<string, unknown>
}

export interface Alert {
  id: string
  deviceId: string
  deviceName: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  module?: ModuleType
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
  createdAt: string
}

export interface AnalyticsSummary {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  avgTemperature: number
  avgHumidity: number
  avgRiskScore: number
  criticalAlerts: number
  totalAlerts: number
  energyConsumption: number
  storageEfficiency: number
  zones: ZoneAnalytics[]
  moduleStats?: Record<ModuleType, ModuleStats>
}

export interface ModuleStats {
  deviceCount: number
  onlineCount: number
  avgScore: number
  alertCount: number
  health: number
}

export interface ZoneAnalytics {
  zone: string
  avgTemperature: number
  avgHumidity: number
  avgRiskScore: number
  deviceCount: number
  onlineCount: number
}

export interface TrendData {
  timestamp: string
  value: number
  label?: string
}

export interface Prediction {
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  timeframe: string
  trend: 'increasing' | 'decreasing' | 'stable'
  recommendation: string
}

export interface Report {
  id: string
  type: string
  title: string
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED'
  dateFrom: string
  dateTo: string
  deviceFilter?: string
  module?: ModuleType
  createdAt: string
  downloadUrl?: string
  fileSize?: number
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  createdAt: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface MaintenanceSchedule {
  id: string
  deviceId: string
  deviceName: string
  type: string
  title: string
  description: string
  scheduledDate: string
  completedDate?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  assignedTo?: string
  module: ModuleType
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: string
}

const auth = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/register', { name, email, password }),
  getProfile: () => api.get<User>('/api/auth/profile'),
  updateProfile: (data: Partial<User>) => api.put<User>('/api/auth/profile', data),
}

const devices = {
  getAll: (params?: { zone?: string; enabled?: boolean; module?: ModuleType }) =>
    api.get<Device[]>('/api/devices', { params }),
  getById: (id: string) => api.get<Device>(`/api/devices/${id}`),
  register: (data: Partial<Device>) => api.post<Device>('/api/devices', data),
  update: (id: string, data: Partial<Device>) =>
    api.put<Device>(`/api/devices/${id}`, data),
  delete: (id: string) => api.delete(`/api/devices/${id}`),
  enable: (id: string) => api.post(`/api/devices/${id}/enable`),
  disable: (id: string) => api.post(`/api/devices/${id}/disable`),
  getHealth: () => api.get('/api/devices/health'),
  getGroups: () => api.get('/api/device-groups'),
}

const readings = {
  getLatest: (params?: { module?: ModuleType }) =>
    api.get<Reading[]>('/api/readings/latest', { params }),
  getAll: (params?: {
    device_id?: string
    zone?: string
    module?: ModuleType
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }) => api.get<Reading[]>('/api/readings', { params }),
  getByDevice: (deviceId: string, params?: { start_date?: string; end_date?: string; limit?: number }) =>
    api.get<Reading[]>(`/api/readings/device/${deviceId}`, { params }),
}

const analytics = {
  getSummary: (params?: { start_date?: string; end_date?: string; module?: ModuleType }) =>
    api.get<AnalyticsSummary>('/api/analytics/summary', { params }),
  getDevice: (deviceId: string, params?: { start_date?: string; end_date?: string }) =>
    api.get(`/api/analytics/device/${deviceId}`, { params }),
  getTrend: (params?: { metric?: string; period?: string; device_id?: string; module?: ModuleType }) =>
    api.get<TrendData[]>('/api/analytics/trend', { params }),
  getPredictions: (params?: { module?: ModuleType }) =>
    api.get<Prediction[]>('/api/analytics/predictions', { params }),
  getZoneComparison: (params?: { module?: ModuleType }) =>
    api.get<ZoneAnalytics[]>('/api/analytics/zones', { params }),
  getModuleComparison: () =>
    api.get<Record<ModuleType, ModuleStats>>('/api/analytics/modules'),
}

const alerts = {
  getAll: (params?: { severity?: string; device_id?: string; acknowledged?: boolean; module?: ModuleType }) =>
    api.get<Alert[]>('/api/alerts', { params }),
  getActive: (params?: { module?: ModuleType }) =>
    api.get<Alert[]>('/api/alerts/active', { params }),
  acknowledge: (id: string) => api.post(`/api/alerts/${id}/acknowledge`),
  delete: (id: string) => api.delete(`/api/alerts/${id}`),
  batchAcknowledge: (ids: string[]) => api.post('/api/alerts/batch-acknowledge', { ids }),
  getRules: () => api.get('/api/alert-rules'),
}

const reports = {
  getAll: (params?: { module?: ModuleType }) =>
    api.get<Report[]>('/api/reports', { params }),
  generate: (data: {
    type: string
    date_from: string
    date_to: string
    device_id?: string
    title?: string
    module?: ModuleType
  }) => api.post<Report>('/api/reports', data),
  getById: (id: string) => api.get<Report>(`/api/reports/${id}`),
  download: (id: string) =>
    api.get(`/api/reports/${id}/download`, { responseType: 'blob' }),
}

const maintenance = {
  getAll: (params?: { status?: string; module?: ModuleType; device_id?: string }) =>
    api.get<MaintenanceSchedule[]>('/api/maintenance', { params }),
  getById: (id: string) => api.get<MaintenanceSchedule>(`/api/maintenance/${id}`),
  create: (data: Partial<MaintenanceSchedule>) =>
    api.post<MaintenanceSchedule>('/api/maintenance', data),
  update: (id: string, data: Partial<MaintenanceSchedule>) =>
    api.put<MaintenanceSchedule>(`/api/maintenance/${id}`, data),
  delete: (id: string) => api.delete(`/api/maintenance/${id}`),
  complete: (id: string) => api.post(`/api/maintenance/${id}/complete`),
}

const dashboard = {
  getOverview: () => api.get('/api/dashboard/overview'),
  getModuleSummary: (module: ModuleType) =>
    api.get(`/api/dashboard/module/${module}`),
  getRecentActivity: () => api.get('/api/dashboard/activity'),
}

const notifications = {
  getAll: () => api.get<Notification[]>('/api/notifications'),
  markRead: (id: string) => api.post(`/api/notifications/${id}/read`),
  markAllRead: () => api.post('/api/notifications/read-all'),
  getUnreadCount: () => api.get<{ count: number }>('/api/notifications/unread-count'),
}

const exportData = {
  exportExcel: (type: string, params?: Record<string, string>) =>
    api.get(`/api/export/${type}`, { params, responseType: 'blob' }),
}

const apiClient = {
  auth,
  devices,
  readings,
  analytics,
  alerts,
  reports,
  maintenance,
  dashboard,
  notifications,
  exportData,
}

export default apiClient
