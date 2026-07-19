import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { useDevices } from '@/hooks/useDevices'
import { getRiskLabel, getRiskColor } from '@/lib/utils'

export function RiskMeter() {
  const { data: devices } = useDevices()
  const avgRisk = devices && devices.length > 0
    ? devices.reduce((sum, d) => sum + (d.risk_score || 0), 0) / devices.length
    : 0

  const riskColor = avgRisk <= 25 ? '#22c55e' : avgRisk <= 50 ? '#eab308' : avgRisk <= 75 ? '#f97316' : '#ef4444'

  const chartData = [
    { name: 'risk', value: avgRisk, fill: riskColor },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-5"
    >
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Avg Risk Score</h3>
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
            <span className={`text-2xl font-bold ${getRiskColor(avgRisk)}`}>
              {Math.round(avgRisk)}
            </span>
            <span className={`text-xs font-medium ${getRiskColor(avgRisk)}`}>
              {getRiskLabel(avgRisk)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-3">
        {[
          { label: 'Safe', color: 'bg-emerald-400', range: '0-25' },
          { label: 'Warn', color: 'bg-yellow-400', range: '26-50' },
          { label: 'High', color: 'bg-orange-400', range: '51-75' },
          { label: 'Crit', color: 'bg-red-400', range: '76-100' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <div className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
