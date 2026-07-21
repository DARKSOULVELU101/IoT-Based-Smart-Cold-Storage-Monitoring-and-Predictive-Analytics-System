import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import StatusBadge from './StatusBadge'
import type { Reading, ModuleType } from '../services/api'
import { Thermometer, Droplets, Wifi, WifiOff, Clock, Cpu, Droplet, Warehouse } from 'lucide-react'
import clsx from 'clsx'

interface DeviceCardProps {
  reading: Reading
  index?: number
}

const moduleIcons: Record<string, typeof Thermometer> = {
  'cold-storage': Thermometer,
  'machine-health': Cpu,
  'water-quality': Droplet,
  'warehouse': Warehouse,
}

const moduleColors: Record<string, string> = {
  'cold-storage': 'text-cold-400',
  'machine-health': 'text-machine-400',
  'water-quality': 'text-water-400',
  'warehouse': 'text-warehouse-400',
}

export default function DeviceCard({ reading, index = 0 }: DeviceCardProps) {
  const navigate = useNavigate()
  const isOnline = reading.status !== 'OFFLINE'
  const moduleType = reading.module || 'cold-storage'
  const ModuleIcon = moduleIcons[moduleType] || Thermometer
  const moduleColor = moduleColors[moduleType] || 'text-cold-400'

  const detailPath = `/${moduleType}/${reading.deviceId}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={() => navigate(detailPath)}
      className="glass-card p-5 cursor-pointer hover:border-gray-700/60 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx('p-2 rounded-lg bg-gray-800/50', moduleColor)}>
            <ModuleIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100 text-sm">{reading.deviceId}</h3>
            <p className="text-xs text-gray-500">{reading.zone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={reading.status} size="sm" />
          {isOnline ? (
            <Wifi className="w-4 h-4 text-emerald-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-cold-400" />
          <span className="text-sm text-gray-300">{reading.temperature.toFixed(1)}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300">{reading.humidity.toFixed(1)}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Risk: {reading.riskScore}/100</span>
        {reading.timestamp && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(reading.timestamp), 'HH:mm')}
          </div>
        )}
      </div>

      <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5">
        <div
          className={clsx(
            'h-1.5 rounded-full transition-all duration-500',
            reading.riskScore > 70 ? 'bg-red-500' : reading.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
          )}
          style={{ width: `${Math.min(reading.riskScore, 100)}%` }}
        />
      </div>
    </motion.div>
  )
}
