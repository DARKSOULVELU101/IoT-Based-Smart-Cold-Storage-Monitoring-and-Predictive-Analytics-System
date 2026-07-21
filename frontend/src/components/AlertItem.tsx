import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'
import type { Alert } from '../services/api'

interface AlertItemProps {
  alert: Alert
  onAcknowledge?: (id: string) => void
  onDelete?: (id: string) => void
  index?: number
}

const severityConfig = {
  LOW: { icon: Clock, bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  MEDIUM: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  HIGH: { icon: AlertTriangle, bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  CRITICAL: { icon: AlertTriangle, bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
}

export default function AlertItem({ alert, onAcknowledge, onDelete, index = 0 }: AlertItemProps) {
  const config = severityConfig[alert.severity] || severityConfig.LOW
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={clsx(
        'flex items-start gap-4 p-4 rounded-xl border transition-all duration-200',
        config.bg, config.border,
        alert.acknowledged && 'opacity-60'
      )}
    >
      <div className={clsx('p-2 rounded-lg', config.bg)}>
        <Icon className={clsx('w-5 h-5', config.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={clsx('text-xs font-semibold uppercase', config.text)}>{alert.severity}</span>
          <span className="text-xs text-gray-600">•</span>
          <span className="text-xs text-gray-500">{alert.type}</span>
          {alert.module && (
            <>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs text-gray-500 capitalize">{alert.module.replace('-', ' ')}</span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-200 mb-1">{alert.message}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Device: {alert.deviceName || alert.deviceId}</span>
          <span>•</span>
          <span>{format(new Date(alert.createdAt), 'MMM d, HH:mm:ss')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!alert.acknowledged && onAcknowledge && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id) }}
            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            title="Acknowledge"
          >
            <CheckCircle className="w-4 h-4" />
          </motion.button>
        )}
        {onDelete && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onDelete(alert.id) }}
            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
