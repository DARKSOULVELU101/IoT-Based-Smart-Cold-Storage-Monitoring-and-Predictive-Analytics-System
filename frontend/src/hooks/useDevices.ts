import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceAPI, type Device } from '@/services/api'

export function useDevices() {
  return useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data } = await deviceAPI.getAll()
      return data
    },
    refetchInterval: 10000,
  })
}

export function useDevice(id: number) {
  return useQuery<Device>({
    queryKey: ['device', id],
    queryFn: async () => {
      const { data } = await deviceAPI.getById(id)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Device>) => deviceAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })
}

export function useUpdateDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Device> }) =>
      deviceAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })
}

export function useDeleteDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deviceAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })
}

export function useDisableDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deviceAPI.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })
}

export function useEnableDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deviceAPI.enable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })
}
