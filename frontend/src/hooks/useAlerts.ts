import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../services/api'
import toast from 'react-hot-toast'
import type { ModuleType } from '../services/api'

export function useAlerts(params?: {
  severity?: string
  device_id?: string
  acknowledged?: boolean
  module?: ModuleType
}) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: async () => {
      const { data } = await apiClient.alerts.getAll(params as any)
      return data
    },
    refetchInterval: 15000,
  })
}

export function useActiveAlerts(module?: ModuleType) {
  return useQuery({
    queryKey: ['alerts', 'active', module],
    queryFn: async () => {
      const { data } = await apiClient.alerts.getActive(module ? { module } : undefined)
      return data
    },
    refetchInterval: 15000,
  })
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.alerts.acknowledge(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert acknowledged')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to acknowledge alert')
    },
  })
}

export function useDeleteAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.alerts.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete alert')
    },
  })
}

export function useBatchAcknowledgeAlerts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await apiClient.alerts.batchAcknowledge(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alerts acknowledged')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to acknowledge alerts')
    },
  })
}
