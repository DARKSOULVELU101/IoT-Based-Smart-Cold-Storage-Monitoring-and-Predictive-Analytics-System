import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  Filter,
} from 'lucide-react'
import { AlertTable } from '@/components/AlertTable'
import { AlertTimeline } from '@/charts/AlertTimeline'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useAlerts, useAlertStats, useResolveAlert } from '@/hooks/useAlerts'
import { cn } from '@/lib/utils'

export function Alerts() {
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterResolved, setFilterResolved] = useState<boolean>(false)
  const { data: alerts, isLoading } = useAlerts({
    level: filterLevel === 'all' ? undefined : filterLevel,
    resolved: filterResolved,
  })
  const { data: stats } = useAlertStats()
  const resolveAlert = useResolveAlert()

  const handleResolve = async (alert: { id: number }) => {
    await resolveAlert.mutateAsync(alert.id)
  }

  const statCards = [
    {
      label: 'Total Alerts',
      value: stats?.total || 0,
      icon: Bell,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Active',
      value: stats?.active || 0,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Resolved',
      value: stats?.resolved || 0,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Critical',
      value: stats?.by_level?.critical || 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
        <p className="text-sm text-muted-foreground">
          Monitor and manage system alerts
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
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
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Level:</span>
          <div className="flex gap-1">
            {['all', 'critical', 'warning', 'info'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors',
                  filterLevel === level
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-white/[0.04]'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setFilterResolved(false)}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                !filterResolved
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-white/[0.04]'
              )}
            >
              Active
            </button>
            <button
              onClick={() => setFilterResolved(true)}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                filterResolved
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-white/[0.04]'
              )}
            >
              Resolved
            </button>
          </div>
        </div>
      </motion.div>

      <AlertTable
        alerts={alerts || []}
        onResolve={handleResolve}
        loading={isLoading}
      />

      <AlertTimeline />

      {stats?.by_type && Object.keys(stats.by_type).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <h3 className="mb-4 section-title">Alert Types Breakdown</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(stats.by_type).map(([type, count], index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="rounded-lg bg-white/[0.02] p-3"
              >
                <p className="text-xs text-muted-foreground capitalize">{type.replace(/_/g, ' ')}</p>
                <p className="text-lg font-bold">{count as number}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
