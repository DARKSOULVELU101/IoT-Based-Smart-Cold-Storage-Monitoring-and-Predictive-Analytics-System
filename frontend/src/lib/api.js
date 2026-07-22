import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const deviceAPI = {
  list: (params) => api.get('/devices/', { params }),
  get: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices/', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  enable: (id) => api.post(`/devices/${id}/enable`),
  disable: (id) => api.post(`/devices/${id}/disable`),
  heartbeat: (id) => api.post(`/devices/${id}/heartbeat`),
  count: () => api.get('/devices/count'),
}

export const telemetryAPI = {
  ingest: (data) => api.post('/telemetry/ingest', data),
  latest: (deviceId) => api.get(`/telemetry/latest/${deviceId}`),
  allLatest: () => api.get('/telemetry/latest'),
  history: (deviceId, params) => api.get(`/telemetry/${deviceId}`, { params }),
  summary: (params) => api.get('/telemetry/stats/summary', { params }),
}

export const dashboardAPI = {
  summary: () => api.get('/dashboard/'),
}

export const analyticsAPI = {
  temperature: (params) => api.get('/analytics/temperature', { params }),
  machineHealth: (params) => api.get('/analytics/machine-health', { params }),
  waterQuality: (params) => api.get('/analytics/water-quality', { params }),
  warehouse: (params) => api.get('/analytics/warehouse', { params }),
  predictive: (params) => api.get('/analytics/predictive', { params }),
}

export const alertAPI = {
  list: (params) => api.get('/alerts/', { params }),
  stats: () => api.get('/alerts/stats'),
  create: (data) => api.post('/alerts/', data),
  resolve: (id) => api.put(`/alerts/${id}/resolve`),
  resolveAll: () => api.post('/alerts/resolve-all'),
}

export const reportAPI = {
  daily: (params) => api.get('/reports/daily', { params }),
  weekly: (params) => api.get('/reports/weekly', { params }),
  monthly: (params) => api.get('/reports/monthly', { params }),
  exportExcel: (params) => api.get('/reports/export/excel', { params, responseType: 'blob' }),
  exportCSV: (params) => api.get('/reports/export/csv', { params, responseType: 'blob' }),
}

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export default api
