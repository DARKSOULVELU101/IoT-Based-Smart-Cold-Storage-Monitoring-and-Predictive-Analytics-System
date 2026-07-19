import { motion } from 'framer-motion'
import { DeviceCard } from '@/components/DeviceCard'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useDevices } from '@/hooks/useDevices'
import type { Device } from '@/services/api'

interface DeviceOverviewProps {
  onViewDevice?: (device: Device) => void
}

export function DeviceOverview({ onViewDevice }: DeviceOverviewProps) {
  const { data: devices, isLoading } = useDevices()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 rounded-lg bg-white/[0.03] shimmer" />
          <div className="h-4 w-20 rounded-lg bg-white/[0.03] shimmer" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-[180px]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title">Device Overview</h3>
        <span className="text-xs text-muted-foreground">
          {devices?.filter((d) => d.status === 'online').length || 0} of {devices?.length || 0} online
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {devices?.map((device, index) => (
          <DeviceCard
            key={device.id}
            device={device}
            index={index}
            onView={onViewDevice}
          />
        ))}
      </div>
      {(!devices || devices.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <p className="text-muted-foreground">No devices registered yet</p>
        </motion.div>
      )}
    </div>
  )
}
