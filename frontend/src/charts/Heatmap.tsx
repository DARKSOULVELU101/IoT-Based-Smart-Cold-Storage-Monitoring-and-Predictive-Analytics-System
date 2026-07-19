import { motion } from 'framer-motion'
import { useAnalytics } from '@/hooks/useAnalytics'

interface HeatmapProps {
  zone?: string
}

export function Heatmap({ zone }: HeatmapProps) {
  const { data: analytics } = useAnalytics({ zone })

  const hourlyData = analytics?.hourly_temperature || []
  const hours = hourlyData.map((d) => d.hour)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getColor = (temp: number) => {
    if (temp < -5) return 'bg-blue-600/80'
    if (temp < 0) return 'bg-blue-400/80'
    if (temp < 3) return 'bg-cyan-400/80'
    if (temp < 5) return 'bg-emerald-400/80'
    if (temp < 8) return 'bg-yellow-400/80'
    if (temp < 10) return 'bg-orange-400/80'
    return 'bg-red-400/80'
  }

  const generateMatrix = () => {
    return days.map((day) =>
      hours.slice(0, 24).map((_, hourIdx) => {
        const baseTemp = hourlyData[hourIdx % hourlyData.length]?.avg_temp || 0
        const variance = (Math.random() - 0.5) * 2
        return { day, hour: hourIdx, temp: baseTemp + variance }
      })
    )
  }

  const matrix = generateMatrix()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-5"
    >
      <h3 className="mb-4 section-title">Temperature Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex gap-0.5">
            <div className="w-10 shrink-0" />
            {hours.slice(0, 24).map((_, i) => (
              <div
                key={i}
                className="flex-1 text-center text-[9px] text-muted-foreground"
              >
                {i % 3 === 0 ? `${i}h` : ''}
              </div>
            ))}
          </div>
          {matrix.map((row, rowIdx) => (
            <div key={rowIdx} className="mt-0.5 flex gap-0.5">
              <div className="flex w-10 shrink-0 items-center text-[10px] text-muted-foreground">
                {row[0]?.day}
              </div>
              {row.map((cell, cellIdx) => (
                <motion.div
                  key={cellIdx}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: rowIdx * 0.02 + cellIdx * 0.01 }}
                  className={`flex-1 aspect-square rounded-sm ${getColor(cell.temp)} cursor-default`}
                  title={`${cell.day} ${cell.hour}h: ${cell.temp.toFixed(1)}°C`}
                />
              ))}
            </div>
          ))}
          <div className="mt-3 flex items-center justify-center gap-1">
            {[
              { color: 'bg-blue-600/80', label: '< -5°C' },
              { color: 'bg-blue-400/80', label: '-5-0°C' },
              { color: 'bg-cyan-400/80', label: '0-3°C' },
              { color: 'bg-emerald-400/80', label: '3-5°C' },
              { color: 'bg-yellow-400/80', label: '5-8°C' },
              { color: 'bg-orange-400/80', label: '8-10°C' },
              { color: 'bg-red-400/80', label: '> 10°C' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div className={`h-2.5 w-2.5 rounded-sm ${item.color}`} />
                <span className="text-[9px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
