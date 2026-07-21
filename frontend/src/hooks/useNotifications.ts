import { useQuery } from '@tanstack/react-query'
import apiClient from '../services/api'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await apiClient.notifications.getAll()
      return data
    },
    refetchInterval: 30000,
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await apiClient.notifications.getUnreadCount()
      return data.count
    },
    refetchInterval: 15000,
  })
}
