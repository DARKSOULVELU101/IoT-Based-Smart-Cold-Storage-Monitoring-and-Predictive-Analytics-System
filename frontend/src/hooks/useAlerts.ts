import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertAPI, type Alert, type AlertStats } from '@/services/api'

export function useAlerts(params?: { level?: string; resolved?: boolean; device_id?: number }) {
  return useQuery<Alert[]>({
    queryKey: ['alerts', params],
    queryFn: async () => {
      const { data } = await alertAPI.getAll(params)
      return data
    },
    refetchInterval: 5000,
  })
}

export function useActiveAlerts() {
  return useQuery<Alert[]>({
    queryKey: ['alerts', 'active'],
    queryFn: async () => {
      const { data } = await alertAPI.getActive()
      return data
    },
    refetchInterval: 5000,
  })
}

export function useResolveAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => alertAPI.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useAlertStats() {
  return useQuery<AlertStats>({
    queryKey: ['alerts', 'stats'],
    queryFn: async () => {
      const { data } = await alertAPI.getStats()
      return data
    },
    refetchInterval: 10000,
  })
}
