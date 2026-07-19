import { motion } from 'framer-motion'
import { Server, Thermometer, Droplets, Shield, MoreVertical, Power, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cn, getZoneColor, getRiskColor, getRiskLabel } from '@/lib/utils'
import type { Device } from '@/services/api'
import { StatusIndicator } from './StatusIndicator'
import { ZoneBadge } from './ZoneBadge'
import { RiskBadge } from './RiskBadge'

interface DeviceCardProps {
  device: Device
  onView?: (device: Device) => void
  onDisable?: (device: Device) => void
  onDelete?: (device: Device) => void
  index?: number
}

export function DeviceCard({ device, onView, onDisable, onDelete, index = 0 }: DeviceCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className="glass-card-hover group relative cursor-pointer overflow-hidden p-5"
      onClick={() => onView?.(device)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Server className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{device.name}</h3>
            <div className="flex items-center gap-2">
              <ZoneBadge zone={device.zone} />
              <StatusIndicator status={device.status} />
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-white/[0.04] hover:text-foreground group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-lg border border-white/[0.08] bg-card/95 shadow-xl backdrop-blur-xl"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDisable?.(device)
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              >
                <Power className="h-3.5 w-3.5" />
                {device.status === 'disabled' ? 'Enable' : 'Disable'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(device)
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-blue-400" />
          <div>
            <p className="text-xs text-muted-foreground">Temp</p>
            <p className="text-sm font-medium">{device.temperature?.toFixed(1)}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-cyan-400" />
          <div>
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="text-sm font-medium">{device.humidity?.toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          <div>
            <p className="text-xs text-muted-foreground">Risk</p>
            <RiskBadge score={device.risk_score} />
          </div>
        </div>
      </div>

      {device.status === 'online' && (
        <div className="mt-3 flex items-center gap-4 border-t border-white/[0.06] pt-3">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              'h-1.5 w-1.5 rounded-full',
              device.door_status === 'closed' ? 'bg-emerald-400' : 'bg-yellow-400'
            )} />
            <span className="text-xs text-muted-foreground">Door {device.door_status}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn(
              'h-1.5 w-1.5 rounded-full',
              device.power_status === 'on' ? 'bg-emerald-400' : 'bg-red-400'
            )} />
            <span className="text-xs text-muted-foreground">Power {device.power_status}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Compressor: {device.compressor_current?.toFixed(1)}A
          </span>
        </div>
      )}
    </motion.div>
  )
}
