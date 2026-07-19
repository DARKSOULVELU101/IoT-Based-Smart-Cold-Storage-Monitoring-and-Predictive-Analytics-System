import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAlerts } from '@/hooks/useAlerts'

export function AlertTimeline() {
  const { data: alerts } = useAlerts()

  const getTimelineData = () => {
    if (!alerts || alerts.length === 0) return []

    const now = new Date()
    const last24h = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
      return {
        hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        critical: 0,
        warning: 0,
        info: 0,
      }
    })

    alerts.forEach((alert) => {
      const alertTime = new Date(alert.created_at)
      const hoursAgo = Math.floor((now.getTime() - alertTime.getTime()) / (60 * 60 * 1000))
      if (hoursAgo >= 0 && hoursAgo < 24) {
        const idx = 23 - hoursAgo
        if (alert.level === 'critical') last24h[idx].critical++
        else if (alert.level === 'warning') last24h[idx].warning++
        else last24h[idx].info++
      }
    })

    return last24h
  }

  const chartData = getTimelineData()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title">Alert Timeline</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <span className="text-xs text-muted-foreground">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="text-xs text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-xs text-muted-foreground">Info</span>
          </div>
        </div>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="warningGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="infoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="url(#criticalGrad)" strokeWidth={2} animationDuration={1000} />
            <Area type="monotone" dataKey="warning" stroke="#eab308" fill="url(#warningGrad)" strokeWidth={2} animationDuration={1000} />
            <Area type="monotone" dataKey="info" stroke="#3b82f6" fill="url(#infoGrad)" strokeWidth={2} animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
