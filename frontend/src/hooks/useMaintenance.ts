import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../services/api'
import toast from 'react-hot-toast'
import type { ModuleType } from '../services/api'

export function useMaintenance(params?: { status?: string; module?: ModuleType; device_id?: string }) {
  return useQuery({
    queryKey: ['maintenance', params],
    queryFn: async () => {
      const { data } = await apiClient.maintenance.getAll(params as any)
      return data
    },
  })
}

export function useMaintenanceItem(id: string) {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: async () => {
      const { data } = await apiClient.maintenance.getById(id)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.maintenance.create(data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance schedule created')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create schedule')
    },
  })
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result } = await apiClient.maintenance.update(id, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update')
    },
  })
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.maintenance.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete')
    },
  })
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.maintenance.complete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance marked as complete')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete')
    },
  })
}
