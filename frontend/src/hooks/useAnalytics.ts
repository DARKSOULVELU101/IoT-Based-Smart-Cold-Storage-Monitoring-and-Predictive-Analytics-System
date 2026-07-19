import { useQuery } from '@tanstack/react-query'
import { analyticsAPI, type AnalyticsData, type Prediction } from '@/services/api'

export function useAnalytics(params?: { device_id?: number; zone?: string; hours?: number }) {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', params],
    queryFn: async () => {
      const { data } = await analyticsAPI.get(params)
      return data
    },
    refetchInterval: 30000,
  })
}

export function usePredictions(params?: { device_id?: number; hours?: number }) {
  return useQuery<Prediction[]>({
    queryKey: ['predictions', params],
    queryFn: async () => {
      const { data } = await analyticsAPI.getPredictions(params)
      return data
    },
    refetchInterval: 60000,
  })
}
