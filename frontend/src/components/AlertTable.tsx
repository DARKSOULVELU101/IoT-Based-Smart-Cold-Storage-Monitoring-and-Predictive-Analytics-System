import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { cn, getAlertLevelColor } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { Alert } from '@/services/api'

interface AlertTableProps {
  alerts: Alert[]
  onResolve?: (alert: Alert) => void
  loading?: boolean
}

export function AlertTable({ alerts, onResolve, loading }: AlertTableProps) {
  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-white/[0.03] shimmer" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <CheckCircle className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
        <p className="text-muted-foreground">No alerts to display</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Device</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Zone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Level</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Message</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <motion.tr
                key={alert.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium">{alert.device_name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{alert.zone}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{alert.alert_type}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                      getAlertLevelColor(alert.level)
                    )}
                  >
                    {alert.level === 'critical' && <AlertTriangle className="h-3 w-3" />}
                    {alert.level}
                  </span>
                </td>
                <td className="max-w-[300px] truncate px-4 py-3 text-sm text-muted-foreground">
                  {alert.message}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      alert.is_resolved
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    )}
                  >
                    {alert.is_resolved ? 'Resolved' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!alert.is_resolved && (
                    <button
                      onClick={() => onResolve?.(alert)}
                      className="rounded-lg px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
