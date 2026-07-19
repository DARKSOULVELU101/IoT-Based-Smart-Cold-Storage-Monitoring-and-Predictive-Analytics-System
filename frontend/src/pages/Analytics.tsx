import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Thermometer,
  Droplets,
  DoorOpen,
  Zap,
  TrendingUp,
  TrendingDown,
  Brain,
  Calendar,
} from 'lucide-react'
import { TemperatureAreaChart } from '@/charts/TemperatureAreaChart'
import { HumidityBarChart } from '@/charts/HumidityBarChart'
import { DoorActivityChart } from '@/charts/DoorActivityChart'
import { CompressorTrend } from '@/charts/CompressorTrend'
import { Heatmap } from '@/charts/Heatmap'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useAnalytics, usePredictions } from '@/hooks/useAnalytics'
import { cn } from '@/lib/utils'

export function Analytics() {
  const [selectedZone, setSelectedZone] = useState<string | undefined>(undefined)
  const [hours, setHours] = useState(24)
  const { data: analytics, isLoading } = useAnalytics({ zone: selectedZone, hours })
  const { data: predictions } = usePredictions({ hours: 24 })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-white/[0.03] shimmer" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-[120px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LoadingSkeleton className="h-[350px]" />
          <LoadingSkeleton className="h-[350px]" />
        </div>
      </div>
    )
  }

  const summaryCards = [
    {
      label: 'Avg Temperature',
      value: `${analytics?.temperature_stats?.avg?.toFixed(1) || 0}°C`,
      icon: Thermometer,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      detail: `Range: ${analytics?.temperature_stats?.min?.toFixed(1) || 0}°C — ${analytics?.temperature_stats?.max?.toFixed(1) || 0}°C`,
    },
    {
      label: 'Avg Humidity',
      value: `${analytics?.humidity_stats?.avg?.toFixed(1) || 0}%`,
      icon: Droplets,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      detail: `Range: ${analytics?.humidity_stats?.min?.toFixed(1) || 0}% — ${analytics?.humidity_stats?.max?.toFixed(1) || 0}%`,
    },
    {
      label: 'Door Events',
      value: analytics?.door_events || 0,
      icon: DoorOpen,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      detail: 'Last 24 hours',
    },
    {
      label: 'Compressor Hours',
      value: `${analytics?.compressor_hours?.toFixed(1) || 0}h`,
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      detail: `Energy: ${analytics?.energy_consumption?.toFixed(1) || 0} kWh`,
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Deep insights into your cold storage performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedZone || ''}
            onChange={(e) => setSelectedZone(e.target.value || undefined)}
            className="glass-input text-sm"
          >
            <option value="">All Zones</option>
            <option value="DAIRY">DAIRY</option>
            <option value="MEDICINE">MEDICINE</option>
            <option value="VEGETABLE">VEGETABLE</option>
          </select>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="glass-input text-sm"
          >
            <option value={6}>Last 6h</option>
            <option value={12}>Last 12h</option>
            <option value={24}>Last 24h</option>
            <option value={48}>Last 48h</option>
            <option value={168}>Last 7 days</option>
          </select>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', card.bg)}>
                  <Icon className={cn('h-5 w-5', card.color)} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold tracking-tight">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TemperatureAreaChart zone={selectedZone} />
        <HumidityBarChart zone={selectedZone} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DoorActivityChart />
        <CompressorTrend />
      </div>

      <Heatmap zone={selectedZone} />

      {analytics?.zone_scores && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <h3 className="mb-4 section-title">Zone Efficiency Scores</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Object.entries(analytics.zone_scores).map(([zone, score], index) => (
              <motion.div
                key={zone}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="rounded-lg bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{zone}</span>
                  <span className={cn('text-lg font-bold', score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400')}>
                    {Math.round(score as number)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                    className={cn(
                      'h-full rounded-full',
                      (score as number) >= 80 ? 'bg-emerald-400' : (score as number) >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {predictions && predictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="section-title">Predictive Analytics</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {predictions.slice(0, 8).map((pred, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="rounded-lg bg-white/[0.02] p-3"
              >
                <p className="text-[10px] text-muted-foreground mb-1">
                  {new Date(pred.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-blue-400">Temp</span>
                    <span className="text-xs font-medium">{pred.predicted_temperature?.toFixed(1)}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cyan-400">Humid</span>
                    <span className="text-xs font-medium">{pred.predicted_humidity?.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-400">Risk</span>
                    <span className="text-xs font-medium">{Math.round(pred.predicted_risk)}</span>
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-1">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${pred.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{(pred.confidence * 100).toFixed(0)}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
