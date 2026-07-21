import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'
import type { Alert } from '../services/api'

interface Props {
  alerts: Alert[]
  onAcknowledge?: (id: string) => void
}

const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  MEDIUM: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  LOW: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
}

export default function CriticalAlerts({ alerts, onAcknowledge }: Props) {
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">Critical Alerts</h3>
        {criticalCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />{criticalCount}
          </span>
        )}
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 text-gray-500">
              <CheckCircle className="w-10 h-10 text-emerald-500/50 mb-2" />
              <p className="text-sm">No active alerts</p>
              <p className="text-xs text-gray-600">All systems operational</p>
            </motion.div>
          ) : (
            alerts.slice(0, 10).map((alert, index) => {
              const config = severityConfig[alert.severity] || severityConfig.LOW
              return (
                <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.03 }}
                  className={clsx('p-3 rounded-lg border transition-all duration-200', config.bg, config.border, alert.acknowledged && 'opacity-50')}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx('text-xs font-semibold uppercase', config.text)}>{alert.severity}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{alert.type}</span>
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-1">{alert.message}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                        <Clock className="w-2.5 h-2.5" />
                        {format(new Date(alert.createdAt), 'MMM d, HH:mm')}
                        <span className="mx-1">•</span>{alert.deviceId}
                      </div>
                    </div>
                    {!alert.acknowledged && onAcknowledge && (
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onAcknowledge(alert.id)}
                        className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
