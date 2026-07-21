import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../services/api'
import toast from 'react-hot-toast'

export function useDevices(params?: { zone?: string; enabled?: boolean; module?: string }) {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: async () => {
      const { data } = await apiClient.devices.getAll(params as any)
      return data
    },
  })
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: ['device', id],
    queryFn: async () => {
      const { data } = await apiClient.devices.getById(id)
      return data
    },
    enabled: !!id,
  })
}

export function useRegisterDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; zone: string; type: string; module?: string }) => {
      const { data: result } = await apiClient.devices.register(data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      toast.success('Device registered successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to register device')
    },
  })
}

export function useDeleteDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.devices.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      toast.success('Device deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete device')
    },
  })
}

export function useEnableDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.devices.enable(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      toast.success('Device enabled')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enable device')
    },
  })
}

export function useDisableDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.devices.disable(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      toast.success('Device disabled')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disable device')
    },
  })
}

export function useDeviceHealth() {
  return useQuery({
    queryKey: ['deviceHealth'],
    queryFn: async () => {
      const { data } = await apiClient.devices.getHealth()
      return data
    },
  })
}
