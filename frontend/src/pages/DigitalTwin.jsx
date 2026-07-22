import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Thermometer, Droplets, Wind, Zap, Wifi, WifiOff, Cpu, RefreshCw } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useDevices, useAllLatestTelemetry } from '../lib/hooks'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const ZONE_COLORS = {
  cold_storage: { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-200', accent: 'text-blue-600', glow: 'shadow-blue-500/10' },
  machine_water: { bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-200', accent: 'text-emerald-600', glow: 'shadow-emerald-500/10' },
  warehouse: { bg: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-200', accent: 'text-amber-600', glow: 'shadow-amber-500/10' },
}

function SensorGauge({ icon: Icon, label, value, unit, color, min = 0, max = 100 }) {
  const pct = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4" />
          <circle
            cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${pct * 1.759} 175.9`} strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-gray-900">{value != null ? `${value}${unit}` : '--'}</div>
        <div className="text-[10px] text-gray-400">{label}</div>
      </div>
    </div>
  )
}

function DeviceZone({ device, telemetry }) {
  const zone = ZONE_COLORS[device.device_type] || ZONE_COLORS.cold_storage
  const reading = telemetry || {}
  const isOnline = device.status === 'online'

  return (
    <motion.div variants={item}>
      <div className={`glass-card rounded-2xl p-5 border ${zone.border} relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${zone.bg} opacity-50`} />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${zone.bg} flex items-center justify-center`}>
                <Cpu className={`w-5 h-5 ${zone.accent}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{device.name}</h3>
                <p className="text-[11px] text-gray-400">{device.location || 'No location'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              <Badge variant={device.status} label={device.status} />
            </div>
          </div>

          <div className="flex justify-around py-3">
            <SensorGauge
              icon={Thermometer} label="Temp" value={reading.temperature} unit="°C"
              color="#4F46E5" min={-10} max={60}
            />
            <SensorGauge
              icon={Droplets} label="Humidity" value={reading.humidity} unit="%"
              color="#06B6D4" min={0} max={100}
            />
            <SensorGauge
              icon={Wind} label="Gas" value={reading.gas_level} unit="ppm"
              color="#F59E0B" min={0} max={500}
            />
            <SensorGauge
              icon={Zap} label="Health" value={reading.machine_health_score} unit="%"
              color="#10B981" min={0} max={100}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4 text-[11px] text-gray-400">
              <span>Battery: {device.battery_level != null ? `${device.battery_level}%` : '--'}</span>
              <span>Signal: {device.signal_strength != null ? `${device.signal_strength}dBm` : '--'}</span>
              <span>Latency: {device.latency_ms != null ? `${device.latency_ms}ms` : '--'}</span>
            </div>
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-gray-400" />}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function DigitalTwin() {
  const { data: devices, isLoading: devicesLoading } = useDevices({})
  const { data: latestData, isLoading: telemetryLoading } = useAllLatestTelemetry()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000)
    return () => clearInterval(interval)
  }, [])

  if (devicesLoading || telemetryLoading) return <LoadingSpinner />

  const latestMap = {}
  if (Array.isArray(latestData)) {
    latestData.forEach(r => { if (r.device_id) latestMap[r.device_id] = r })
  } else if (latestData && typeof latestData === 'object') {
    Object.entries(latestData).forEach(([id, r]) => { latestMap[Number(id)] = r })
  }

  const zones = {
    cold_storage: (devices || []).filter(d => d.device_type === 'cold_storage'),
    machine_water: (devices || []).filter(d => d.device_type === 'machine_water'),
    warehouse: (devices || []).filter(d => d.device_type === 'warehouse'),
  }

  const zoneLabels = {
    cold_storage: { title: 'Cold Storage Zone', desc: 'Refrigeration units and temperature-controlled storage' },
    machine_water: { title: 'Machine & Water Zone', desc: 'Industrial machinery and water quality monitoring' },
    warehouse: { title: 'Warehouse Zone', desc: 'Storage facility and inventory environmental monitoring' },
  }

  const totalOnline = (devices || []).filter(d => d.status === 'online').length
  const avgTemp = latestData?.length
    ? (latestData.reduce((s, r) => s + (r.temperature || 0), 0) / latestData.length).toFixed(1)
    : '--'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Digital Twin</h1>
          <p className="text-sm text-gray-500">Real-time 3D facility overview with live sensor data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            Live
          </div>
          <Badge variant="online" label={`${totalOnline}/${devices?.length || 0} Online`} />
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">{devices?.length || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Total Sensors</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{avgTemp}°C</div>
            <div className="text-xs text-gray-400 mt-1">Avg Temperature</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{totalOnline}</div>
            <div className="text-xs text-gray-400 mt-1">Active Connections</div>
          </div>
        </GlassCard>
      </motion.div>

      {Object.entries(zones).map(([type, zoneDevices]) => {
        if (zoneDevices.length === 0) return null
        const zl = zoneLabels[type]
        return (
          <motion.div key={type} variants={item}>
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-900">{zl.title}</h2>
              <p className="text-xs text-gray-400">{zl.desc}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zoneDevices.map(device => (
                <DeviceZone key={device.id} device={device} telemetry={latestMap[device.id]} />
              ))}
            </div>
          </motion.div>
        )
      })}

      {(!devices || devices.length === 0) && (
        <motion.div variants={item}>
          <GlassCard hover={false}>
            <div className="text-center py-12">
              <Cpu className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No devices registered yet. Add devices to see the digital twin.</p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  )
}
