import { useQuery } from '@tanstack/react-query'
import { zoneAPI, type ZoneComparison } from '@/services/api'

export function useZoneComparison() {
  return useQuery<ZoneComparison>({
    queryKey: ['zones', 'comparison'],
    queryFn: async () => {
      const { data } = await zoneAPI.getComparison()
      return data
    },
    refetchInterval: 15000,
  })
}
