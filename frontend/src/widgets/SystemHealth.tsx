import { motion } from 'framer-motion'
import { Activity, Thermometer, Droplets, Zap, Shield } from 'lucide-react'
import type { Reading } from '../services/api'

interface Props {
  readings: Reading[]
}

export default function SystemHealth({ readings }: Props) {
  const onlineCount = readings.filter((r) => r.status !== 'OFFLINE').length
  const totalCount = readings.length
  const healthPercent = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0
  const avgTemp = readings.length ? readings.reduce((s, r) => s + r.temperature, 0) / readings.length : 0
  const avgHumidity = readings.length ? readings.reduce((s, r) => s + r.humidity, 0) / readings.length : 0
  const avgRisk = readings.length ? readings.reduce((s, r) => s + r.riskScore, 0) / readings.length : 0
  const powerLoss = readings.filter((r) => !r.powerAvailable).length

  const metrics = [
    { label: 'System Health', value: `${healthPercent}%`, icon: Activity, color: healthPercent > 80 ? 'text-emerald-400' : healthPercent > 50 ? 'text-amber-400' : 'text-red-400', progress: healthPercent },
    { label: 'Avg Temperature', value: `${avgTemp.toFixed(1)}°C`, icon: Thermometer, color: 'text-cold-400', progress: Math.min(avgTemp * 10, 100) },
    { label: 'Avg Humidity', value: `${avgHumidity.toFixed(1)}%`, icon: Droplets, color: 'text-blue-400', progress: avgHumidity },
    { label: 'Power Status', value: powerLoss === 0 ? 'All OK' : `${powerLoss} Loss`, icon: Zap, color: powerLoss === 0 ? 'text-emerald-400' : 'text-red-400', progress: powerLoss === 0 ? 100 : ((totalCount - powerLoss) / totalCount) * 100 },
    { label: 'Avg Risk Score', value: avgRisk.toFixed(1), icon: Shield, color: avgRisk < 40 ? 'text-emerald-400' : avgRisk < 70 ? 'text-amber-400' : 'text-red-400', progress: 100 - avgRisk },
  ]

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">System Health</h3>
      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div key={metric.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                  <span className="text-xs text-gray-400">{metric.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-200">{metric.value}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(metric.progress, 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                  className={`h-1.5 rounded-full ${metric.progress > 70 ? 'bg-emerald-500' : metric.progress > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-800/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{onlineCount}/{totalCount} devices online</span>
          <span>{healthPercent}% uptime</span>
        </div>
      </div>
    </div>
  )
}
