import { motion } from 'framer-motion'
import { Server, Wifi, Bell, Shield } from 'lucide-react'
import { useDevices } from '@/hooks/useDevices'
import { useActiveAlerts } from '@/hooks/useAlerts'
import { cn } from '@/lib/utils'

export function SystemStatus() {
  const { data: devices } = useDevices()
  const { data: activeAlerts } = useActiveAlerts()

  const onlineCount = devices?.filter((d) => d.status === 'online').length || 0
  const totalCount = devices?.length || 0
  const alertCount = activeAlerts?.length || 0
  const avgRisk = devices && devices.length > 0
    ? Math.round(devices.reduce((sum, d) => sum + (d.risk_score || 0), 0) / devices.length)
    : 0

  const systemHealth = totalCount === 0 ? 0 : Math.round((onlineCount / totalCount) * 100)

  const stats = [
    {
      label: 'Total Devices',
      value: totalCount,
      icon: Server,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Online',
      value: onlineCount,
      icon: Wifi,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Active Alerts',
      value: alertCount,
      icon: Bell,
      color: alertCount > 0 ? 'text-red-400' : 'text-emerald-400',
      bg: alertCount > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10',
    },
    {
      label: 'Avg Risk',
      value: avgRisk,
      icon: Shield,
      color: avgRisk <= 25 ? 'text-emerald-400' : avgRisk <= 50 ? 'text-yellow-400' : 'text-red-400',
      bg: avgRisk <= 25 ? 'bg-emerald-500/10' : avgRisk <= 50 ? 'bg-yellow-500/10' : 'bg-red-500/10',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">System Status</h3>
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'h-2 w-2 rounded-full',
            systemHealth > 80 ? 'bg-emerald-400' : systemHealth > 50 ? 'bg-yellow-400' : 'bg-red-400'
          )} />
          <span className="text-xs text-muted-foreground">{systemHealth}% health</span>
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-full bg-white/[0.03]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${systemHealth}%` }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className={cn(
            'h-1.5 rounded-full',
            systemHealth > 80 ? 'bg-emerald-400' : systemHealth > 50 ? 'bg-yellow-400' : 'bg-red-400'
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-2.5 rounded-lg bg-white/[0.02] p-3"
            >
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', stat.bg)}>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold">{stat.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
