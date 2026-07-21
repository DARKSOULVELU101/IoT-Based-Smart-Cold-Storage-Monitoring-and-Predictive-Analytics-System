import { motion } from 'framer-motion'
import { Bell, Clock, Server, AlertTriangle, Settings, Activity } from 'lucide-react'
import { format } from 'date-fns'

interface ActivityEvent {
  id: string
  type: 'alert' | 'device' | 'maintenance' | 'system'
  title: string
  description: string
  timestamp: string
}

interface Props {
  activities?: ActivityEvent[]
}

const defaultActivities: ActivityEvent[] = [
  { id: '1', type: 'alert', title: 'High temperature detected', description: 'Zone MEAT temperature exceeded threshold', timestamp: new Date().toISOString() },
  { id: '2', type: 'device', title: 'Device came online', description: 'COMPRESSOR_03 reconnected', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: '3', type: 'maintenance', title: 'Maintenance completed', description: 'Filter replacement for HVAC_02', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: '4', type: 'system', title: 'System backup completed', description: 'All data backed up successfully', timestamp: new Date(Date.now() - 900000).toISOString() },
]

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  alert: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  device: { icon: Server, color: 'text-cold-400', bg: 'bg-cold-500/10' },
  maintenance: { icon: Settings, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  system: { icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
}

export default function RecentActivity({ activities = defaultActivities }: Props) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">Recent Activity</h3>
        <Clock className="w-4 h-4 text-gray-500" />
      </div>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const config = typeConfig[activity.type] || typeConfig.system
          const Icon = config.icon
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className={`p-1.5 rounded-lg ${config.bg} flex-shrink-0 mt-0.5`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.description}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{format(new Date(activity.timestamp), 'MMM d, HH:mm')}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
