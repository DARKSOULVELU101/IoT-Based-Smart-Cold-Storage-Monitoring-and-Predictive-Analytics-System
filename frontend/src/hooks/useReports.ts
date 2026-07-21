import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../services/api'
import toast from 'react-hot-toast'
import type { ModuleType } from '../services/api'

export function useReports(module?: ModuleType) {
  return useQuery({
    queryKey: ['reports', module],
    queryFn: async () => {
      const { data } = await apiClient.reports.getAll(module ? { module } : undefined)
      return data
    },
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      type: string
      date_from: string
      date_to: string
      device_id?: string
      title?: string
      module?: ModuleType
    }) => {
      const { data: result } = await apiClient.reports.generate(data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Report generation started')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate report')
    },
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.reports.download(id)
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${id}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    onSuccess: () => {
      toast.success('Report downloaded')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to download report')
    },
  })
}
