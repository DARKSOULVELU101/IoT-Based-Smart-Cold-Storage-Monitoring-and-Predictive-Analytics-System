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
import { useAnalytics } from '@/hooks/useAnalytics'

interface TemperatureAreaChartProps {
  zone?: string
  device_id?: number
}

export function TemperatureAreaChart({ zone, device_id }: TemperatureAreaChartProps) {
  const { data: analytics } = useAnalytics({ zone, device_id })

  const chartData = analytics?.hourly_temperature || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-5"
    >
      <h3 className="mb-4 section-title">Temperature History</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="hour"
              stroke="rgba(255,255,255,0.3)"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="max_temp"
              stroke="#ef4444"
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4 4"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="avg_temp"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#tempGradient)"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="min_temp"
              stroke="#22c55e"
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4 4"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 bg-red-400" />
          <span className="text-xs text-muted-foreground">Max</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 bg-blue-400" />
          <span className="text-xs text-muted-foreground">Avg</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 bg-emerald-400" />
          <span className="text-xs text-muted-foreground">Min</span>
        </div>
      </div>
    </motion.div>
  )
}
