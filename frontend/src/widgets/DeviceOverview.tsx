import { motion } from 'framer-motion'
import { Server, Wifi, WifiOff, Thermometer, Droplets } from 'lucide-react'
import type { Reading } from '../services/api'

interface Props {
  readings: Reading[]
}

export default function DeviceOverview({ readings }: Props) {
  const onlineCount = readings.filter((r) => r.status !== 'OFFLINE').length
  const offlineCount = readings.length - onlineCount

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">Device Overview</h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-400">{onlineCount} Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-gray-400">{offlineCount} Offline</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {readings.map((reading, index) => (
          <motion.div
            key={reading.deviceId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${reading.status !== 'OFFLINE' ? 'bg-emerald-500/10' : 'bg-gray-500/10'}`}>
                <Server className={`w-4 h-4 ${reading.status !== 'OFFLINE' ? 'text-emerald-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">{reading.deviceId}</p>
                <p className="text-xs text-gray-500">{reading.zone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Thermometer className="w-3 h-3 text-cold-400" />
                <span>{reading.temperature.toFixed(1)}°</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Droplets className="w-3 h-3 text-blue-400" />
                <span>{reading.humidity.toFixed(0)}%</span>
              </div>
              {reading.status !== 'OFFLINE' ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-gray-500" />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
