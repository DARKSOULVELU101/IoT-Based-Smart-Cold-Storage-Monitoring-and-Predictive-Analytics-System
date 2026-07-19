import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Thermometer,
  Droplets,
  Bell,
  Shield,
  Activity,
} from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { DeviceOverview } from '@/widgets/DeviceOverview'
import { TempGauge } from '@/widgets/TempGauge'
import { RiskMeter } from '@/widgets/RiskMeter'
import { SystemStatus } from '@/widgets/SystemStatus'
import { RealtimeLineChart } from '@/charts/RealtimeLineChart'
import { RiskTrendChart } from '@/charts/RiskTrendChart'
import { AlertTimeline } from '@/charts/AlertTimeline'
import { AlertTable } from '@/components/AlertTable'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { useDevices } from '@/hooks/useDevices'
import { useAlerts, useResolveAlert } from '@/hooks/useAlerts'
import type { Device } from '@/services/api'

export function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: devices, isLoading: devicesLoading } = useDevices()
  const { data: alerts } = useAlerts({ resolved: false })
  const resolveAlert = useResolveAlert()
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  const onlineDevices = devices?.filter((d) => d.status === 'online') || []
  const avgTemp = onlineDevices.length > 0
    ? onlineDevices.reduce((sum, d) => sum + d.temperature, 0) / onlineDevices.length
    : 0
  const avgHumidity = onlineDevices.length > 0
    ? onlineDevices.reduce((sum, d) => sum + d.humidity, 0) / onlineDevices.length
    : 0
  const avgRisk = onlineDevices.length > 0
    ? onlineDevices.reduce((sum, d) => sum + d.risk_score, 0) / onlineDevices.length
    : 0

  const stats = [
    {
      title: 'Online Devices',
      value: summary?.online_devices || 0,
      change: 5.2,
      icon: Server,
      color: 'bg-blue-500/10',
    },
    {
      title: 'Avg Temperature',
      value: `${avgTemp.toFixed(1)}`,
      suffix: '°C',
      change: -1.3,
      icon: Thermometer,
      color: 'bg-cyan-500/10',
    },
    {
      title: 'Avg Humidity',
      value: `${avgHumidity.toFixed(1)}`,
      suffix: '%',
      change: 0.8,
      icon: Droplets,
      color: 'bg-teal-500/10',
    },
    {
      title: 'Active Alerts',
      value: alerts?.length || 0,
      change: -12.5,
      icon: Bell,
      color: 'bg-red-500/10',
    },
    {
      title: 'Avg Risk Score',
      value: avgRisk.toFixed(0),
      change: -3.1,
      icon: Shield,
      color: 'bg-amber-500/10',
    },
    {
      title: 'System Status',
      value: summary?.system_status || 'OK',
      icon: Activity,
      color: 'bg-emerald-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring of your cold storage infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Live</span>
          </div>
        </div>
      </motion.div>

      {summaryLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-[140px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.title} {...stat} loading={summaryLoading} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RealtimeLineChart />
        </div>
        <div className="space-y-4">
          <TempGauge />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <RiskTrendChart />
        <AlertTimeline />
        <SystemStatus />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DeviceOverview onViewDevice={setSelectedDevice} />
        </div>
        <div className="space-y-4">
          <RiskMeter />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-5"
          >
            <h3 className="mb-3 section-title">Recent Alerts</h3>
            <div className="space-y-2">
              {alerts?.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-white/[0.02]"
                >
                  <div
                    className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                      alert.level === 'critical' ? 'bg-red-400' :
                      alert.level === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground">{alert.device_name}</p>
                  </div>
                </div>
              ))}
              {(!alerts || alerts.length === 0) && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No active alerts
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
