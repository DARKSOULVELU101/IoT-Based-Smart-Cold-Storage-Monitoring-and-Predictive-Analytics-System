import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useAnalytics } from '@/hooks/useAnalytics'

interface CompressorTrendProps {
  device_id?: number
}

export function CompressorTrend({ device_id }: CompressorTrendProps) {
  const { data: analytics } = useAnalytics({ device_id })

  const chartData = analytics?.hourly_temperature?.map((d) => ({
    hour: d.hour,
    current: 3 + Math.random() * 4,
  })) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-5"
    >
      <h3 className="mb-4 section-title">Compressor Current</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} unit="A" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <ReferenceLine y={8} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Threshold', fill: '#ef4444', fontSize: 10 }} />
            <Area type="monotone" dataKey="current" stroke="#f59e0b" fill="url(#compGrad)" strokeWidth={2} animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
