import { useQuery } from '@tanstack/react-query'
import apiClient from '../services/api'
import type { ModuleType } from '../services/api'

export function useLatestReadings(module?: ModuleType) {
  return useQuery({
    queryKey: ['readings', 'latest', module],
    queryFn: async () => {
      const { data } = await apiClient.readings.getLatest(module ? { module } : undefined)
      return data
    },
    refetchInterval: 30000,
  })
}

export function useReadings(params?: {
  device_id?: string
  zone?: string
  module?: ModuleType
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ['readings', params],
    queryFn: async () => {
      const { data } = await apiClient.readings.getAll(params)
      return data
    },
  })
}

export function useReadingsByDevice(
  deviceId: string,
  params?: { start_date?: string; end_date?: string; limit?: number }
) {
  return useQuery({
    queryKey: ['readings', 'device', deviceId, params],
    queryFn: async () => {
      const { data } = await apiClient.readings.getByDevice(deviceId, params)
      return data
    },
    enabled: !!deviceId,
    refetchInterval: 30000,
  })
}
