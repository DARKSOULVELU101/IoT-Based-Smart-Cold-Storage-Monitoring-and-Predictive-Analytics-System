import { useQuery } from '@tanstack/react-query'
import apiClient from '../services/api'

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const { data } = await apiClient.dashboard.getOverview()
      return data
    },
    refetchInterval: 30000,
  })
}

export function useDashboardModuleSummary(module: string) {
  return useQuery({
    queryKey: ['dashboard', 'module', module],
    queryFn: async () => {
      const { data } = await apiClient.dashboard.getModuleSummary(module as any)
      return data
    },
    refetchInterval: 30000,
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      const { data } = await apiClient.dashboard.getRecentActivity()
      return data
    },
    refetchInterval: 30000,
  })
}
