import { useQuery } from '@tanstack/react-query'
import { readingAPI, type Reading } from '@/services/api'

export function useReadings(params?: { device_id?: number; limit?: number; offset?: number }) {
  return useQuery<Reading[]>({
    queryKey: ['readings', params],
    queryFn: async () => {
      const { data } = await readingAPI.getAll(params)
      return data
    },
    refetchInterval: 5000,
  })
}

export function useLatestReadings(limit: number = 10) {
  return useQuery<Reading[]>({
    queryKey: ['readings', 'latest', limit],
    queryFn: async () => {
      const { data } = await readingAPI.getLatest(limit)
      return data
    },
    refetchInterval: 5000,
  })
}

export function useDeviceReadings(deviceId: number, limit: number = 50) {
  return useQuery<Reading[]>({
    queryKey: ['readings', 'device', deviceId, limit],
    queryFn: async () => {
      const { data } = await readingAPI.getByDevice(deviceId, limit)
      return data
    },
    enabled: !!deviceId,
    refetchInterval: 5000,
  })
}
