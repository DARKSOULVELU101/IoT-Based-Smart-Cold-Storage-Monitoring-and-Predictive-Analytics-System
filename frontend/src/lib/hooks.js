import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceAPI, telemetryAPI, dashboardAPI, analyticsAPI, alertAPI, reportAPI } from './api'

export function useDevices(params) {
  return useQuery({ queryKey: ['devices', params], queryFn: () => deviceAPI.list(params).then(r => r.data) })
}

export function useDevice(id) {
  return useQuery({ queryKey: ['device', id], queryFn: () => deviceAPI.get(id).then(r => r.data), enabled: !!id })
}

export function useDeviceCount() {
  return useQuery({ queryKey: ['deviceCount'], queryFn: () => deviceAPI.count().then(r => r.data), refetchInterval: 30000 })
}

export function useCreateDevice() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (data) => deviceAPI.create(data).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }) })
}

export function useUpdateDevice() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, data }) => deviceAPI.update(id, data).then(r => r.data), onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }) })
}

export function useDeleteDevice() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id) => deviceAPI.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }) })
}

export function useDashboardSummary() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => dashboardAPI.summary().then(r => r.data), refetchInterval: 10000 })
}

export function useLatestTelemetry(deviceId) {
  return useQuery({ queryKey: ['latestTelemetry', deviceId], queryFn: () => telemetryAPI.latest(deviceId).then(r => r.data), enabled: !!deviceId, refetchInterval: 5000 })
}

export function useAllLatestTelemetry() {
  return useQuery({ queryKey: ['allLatestTelemetry'], queryFn: () => telemetryAPI.allLatest().then(r => r.data), refetchInterval: 10000 })
}

export function useTelemetryHistory(deviceId, params) {
  return useQuery({ queryKey: ['telemetryHistory', deviceId, params], queryFn: () => telemetryAPI.history(deviceId, params).then(r => r.data), enabled: !!deviceId })
}

export function useTelemetrySummary(params) {
  return useQuery({ queryKey: ['telemetrySummary', params], queryFn: () => telemetryAPI.summary(params).then(r => r.data) })
}

export function useTemperatureAnalytics(params) {
  return useQuery({ queryKey: ['tempAnalytics', params], queryFn: () => analyticsAPI.temperature(params).then(r => r.data) })
}

export function useMachineHealthAnalytics(params) {
  return useQuery({ queryKey: ['healthAnalytics', params], queryFn: () => analyticsAPI.machineHealth(params).then(r => r.data) })
}

export function useWaterQualityAnalytics(params) {
  return useQuery({ queryKey: ['wqAnalytics', params], queryFn: () => analyticsAPI.waterQuality(params).then(r => r.data) })
}

export function useWarehouseAnalytics(params) {
  return useQuery({ queryKey: ['warehouseAnalytics', params], queryFn: () => analyticsAPI.warehouse(params).then(r => r.data) })
}

export function usePredictiveAnalytics(params) {
  return useQuery({ queryKey: ['predictiveAnalytics', params], queryFn: () => analyticsAPI.predictive(params).then(r => r.data) })
}

export function useAlerts(params) {
  return useQuery({ queryKey: ['alerts', params], queryFn: () => alertAPI.list(params).then(r => r.data) })
}

export function useAlertStats() {
  return useQuery({ queryKey: ['alertStats'], queryFn: () => alertAPI.stats().then(r => r.data) })
}

export function useResolveAlert() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id) => alertAPI.resolve(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['alerts'] }); qc.invalidateQueries({ queryKey: ['alertStats'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }) } })
}

export function useDailyReport(params) {
  return useQuery({ queryKey: ['dailyReport', params], queryFn: () => reportAPI.daily(params).then(r => r.data) })
}

export function useWeeklyReport(params) {
  return useQuery({ queryKey: ['weeklyReport', params], queryFn: () => reportAPI.weekly(params).then(r => r.data) })
}

export function useMonthlyReport(params) {
  return useQuery({ queryKey: ['monthlyReport', params], queryFn: () => reportAPI.monthly(params).then(r => r.data) })
}
