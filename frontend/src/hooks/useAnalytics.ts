import { useQuery } from '@tanstack/react-query'
import apiClient from '../services/api'
import type { ModuleType } from '../services/api'

export function useAnalytics(params?: { start_date?: string; end_date?: string; module?: ModuleType }) {
  return useQuery({
    queryKey: ['analytics', 'summary', params],
    queryFn: async () => {
      const { data } = await apiClient.analytics.getSummary(params)
      return data
    },
    refetchInterval: 60000,
  })
}

export function useDeviceAnalytics(
  deviceId: string,
  params?: { start_date?: string; end_date?: string }
) {
  return useQuery({
    queryKey: ['analytics', 'device', deviceId, params],
    queryFn: async () => {
      const { data } = await apiClient.analytics.getDevice(deviceId, params)
      return data
    },
    enabled: !!deviceId,
  })
}

export function useRiskTrend(params?: { metric?: string; period?: string; device_id?: string; module?: ModuleType }) {
  return useQuery({
    queryKey: ['analytics', 'trend', params],
    queryFn: async () => {
      const { data } = await apiClient.analytics.getTrend(params)
      return data
    },
    refetchInterval: 60000,
  })
}

export function usePredictions(module?: ModuleType) {
  return useQuery({
    queryKey: ['analytics', 'predictions', module],
    queryFn: async () => {
      const { data } = await apiClient.analytics.getPredictions(module ? { module } : undefined)
      return data
    },
    refetchInterval: 300000,
  })
}

export function useZoneComparison(module?: ModuleType) {
  return useQuery({
    queryKey: ['analytics', 'zones', module],
    queryFn: async () => {
      const { data } = await apiClient.analytics.getZoneComparison(module ? { module } : undefined)
      return data
    },
    refetchInterval: 60000,
  })
}

export function useModuleComparison() {
  return useQuery({
    queryKey: ['analytics', 'modules'],
    queryFn: async () => {
      const { data } = await apiClient.analytics.getModuleComparison()
      return data
    },
    refetchInterval: 60000,
  })
}
