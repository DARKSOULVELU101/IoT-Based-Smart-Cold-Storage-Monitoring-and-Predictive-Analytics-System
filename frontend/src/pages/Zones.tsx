import { motion } from 'framer-motion'
import { MapPin, Thermometer, Droplets, Shield, Server, Zap, DoorOpen, Power } from 'lucide-react'
import { ZoneComparisonChart } from '@/charts/ZoneComparisonChart'
import { TemperatureAreaChart } from '@/charts/TemperatureAreaChart'
import { HumidityBarChart } from '@/charts/HumidityBarChart'
import { CompressorTrend } from '@/charts/CompressorTrend'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useZoneComparison } from '@/hooks/useZone'
import { cn } from '@/lib/utils'

const zoneConfig: Record<string, { color: string; gradient: string; icon: string }> = {
  DAIRY: {
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    icon: '🧊',
  },
  MEDICINE: {
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-pink-500/20',
    icon: '💊',
  },
  VEGETABLE: {
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    icon: '🥬',
  },
}

export function Zones() {
  const { data: comparison, isLoading } = useZoneComparison()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-white/[0.03] shimmer" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-[250px]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Zone Comparison</h1>
        <p className="text-sm text-muted-foreground">
          Compare performance across storage zones
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {comparison?.zones?.map((zone, index) => {
          const config = zoneConfig[zone.zone] || { color: 'text-slate-400', gradient: 'from-slate-500/20 to-slate-500/20', icon: '📦' }
          return (
            <motion.div
              key={zone.zone}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="glass-card overflow-hidden"
            >
              <div className={cn('bg-gradient-to-br p-5', config.gradient)}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">{config.icon}</div>
                  <div>
                    <h3 className={cn('text-lg font-semibold', config.color)}>{zone.zone}</h3>
                    <p className="text-xs text-muted-foreground">
                      {zone.device_count} devices · {zone.online_count} online
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-black/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Thermometer className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-[10px] text-muted-foreground">Avg Temp</span>
                    </div>
                    <p className="text-lg font-bold">{zone.avg_temperature?.toFixed(1)}°C</p>
                  </div>
                  <div className="rounded-lg bg-black/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-[10px] text-muted-foreground">Avg Humidity</span>
                    </div>
                    <p className="text-lg font-bold">{zone.avg_humidity?.toFixed(1)}%</p>
                  </div>
                  <div className="rounded-lg bg-black/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-[10px] text-muted-foreground">Risk Score</span>
                    </div>
                    <p className="text-lg font-bold">{Math.round(zone.avg_risk)}</p>
                  </div>
                  <div className="rounded-lg bg-black/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="h-3.5 w-3.5 text-yellow-400" />
                      <span className="text-[10px] text-muted-foreground">Compressor</span>
                    </div>
                    <p className="text-lg font-bold">{zone.compressor_avg?.toFixed(1)}A</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs text-muted-foreground">{zone.door_events} door events</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Power className={cn('h-3.5 w-3.5', zone.power_status === 'on' ? 'text-emerald-400' : 'text-red-400')} />
                  <span className="text-xs text-muted-foreground capitalize">Power {zone.power_status}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ZoneComparisonChart />
        <TemperatureAreaChart />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <HumidityBarChart />
        <CompressorTrend />
      </div>
    </div>
  )
}
