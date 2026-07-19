import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { useDevices } from '@/hooks/useDevices'
import { formatTemperature } from '@/lib/utils'

export function TempGauge() {
  const { data: devices } = useDevices()
  const avgTemp = devices && devices.length > 0
    ? devices.reduce((sum, d) => sum + (d.temperature || 0), 0) / devices.length
    : 0

  const minTemp = devices && devices.length > 0
    ? Math.min(...devices.map((d) => d.temperature || 0))
    : 0

  const maxTemp = devices && devices.length > 0
    ? Math.max(...devices.map((d) => d.temperature || 0))
    : 0

  const normalizedTemp = Math.min(Math.max((avgTemp + 10) / 50 * 100, 0), 100)

  const chartData = [
    { name: 'temp', value: normalizedTemp, fill: avgTemp < 0 ? '#3b82f6' : avgTemp < 5 ? '#06b6d4' : '#f59e0b' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-5"
    >
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Avg Temperature</h3>
      <div className="flex items-center justify-center">
        <div className="relative">
          <RadialBarChart
            width={180}
            height={180}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            startAngle={210}
            endAngle={-30}
            data={chartData}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              background={{ fill: 'rgba(255,255,255,0.05)' }}
              dataKey="value"
              cornerRadius={10}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </RadialBarChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{formatTemperature(avgTemp)}</span>
            <span className="text-xs text-muted-foreground">range</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-between px-4 text-xs text-muted-foreground">
        <span>Min: {formatTemperature(minTemp)}</span>
        <span>Max: {formatTemperature(maxTemp)}</span>
      </div>
    </motion.div>
  )
}
