import { useQuery } from '@tanstack/react-query'
import { dashboardAPI, type DashboardSummary } from '@/services/api'

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await dashboardAPI.getSummary()
      return data
    },
    refetchInterval: 5000,
  })
}
