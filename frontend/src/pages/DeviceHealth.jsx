import { motion } from 'framer-motion'
import {
  Battery, BatteryLow, BatteryFull, BatteryWarning,
  Wifi, WifiOff, Clock, Activity, Cpu, Signal,
  ShieldCheck, ShieldAlert, AlertTriangle
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useDevices, useAllLatestTelemetry } from '../lib/hooks'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

function BatteryIndicator({ level }) {
  if (level == null) return <span className="text-xs text-gray-400">N/A</span>
  const color = level > 60 ? '#10B981' : level > 20 ? '#F59E0B' : '#EF4444'
  const Icon = level > 60 ? BatteryFull : level > 20 ? BatteryWarning : BatteryLow
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <Icon className="w-4 h-4" style={{ color }} />
      <span className="text-sm font-medium" style={{ color }}>{level}%</span>
    </div>
  )
}

function SignalMeter({ strength }) {
  if (strength == null) return <span className="text-xs text-gray-400">N/A</span>
  const normalized = Math.min(Math.max(((strength + 100) / 100) * 100, 0), 100)
  const bars = normalized > 75 ? 4 : normalized > 50 ? 3 : normalized > 25 ? 2 : 1
  const color = normalized > 60 ? '#10B981' : normalized > 30 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-0.5">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="w-1.5 rounded-full transition-all duration-500"
            style={{
              height: `${i * 4}px`,
              backgroundColor: i <= bars ? color : '#E5E7EB',
            }}
          />
        ))}
      </div>
      <Signal className="w-4 h-4" style={{ color }} />
      <span className="text-sm font-medium" style={{ color }}>{strength}dBm</span>
    </div>
  )
}

function LatencyMeter({ latency }) {
  if (latency == null) return <span className="text-xs text-gray-400">N/A</span>
  const color = latency < 200 ? '#10B981' : latency < 500 ? '#F59E0B' : '#EF4444'
  const label = latency < 200 ? 'Excellent' : latency < 500 ? 'Good' : 'Poor'
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4" style={{ color }} />
      <span className="text-sm font-medium" style={{ color }}>{latency}ms</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>{label}</span>
    </div>
  )
}

function HealthGauge({ score }) {
  if (score == null) return <span className="text-xs text-gray-400">N/A</span>
  const color = score > 80 ? '#10B981' : score > 60 ? '#3B82F6' : score > 40 ? '#F59E0B' : '#EF4444'
  const Icon = score > 70 ? ShieldCheck : ShieldAlert
  const pct = Math.min(Math.max(score, 0), 100)
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" fill="none" stroke="#f3f4f6" strokeWidth="4" />
          <circle
            cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${(pct / 100) * 150.8} 150.8`} strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div>
        <div className="text-lg font-bold" style={{ color }}>{score}%</div>
        <div className="text-[10px] text-gray-400">Health Score</div>
      </div>
    </div>
  )
}

function ConnectionStatus({ device }) {
  const isOnline = device.status === 'online'
  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <Wifi className="w-4 h-4 text-emerald-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-gray-400" />
      )}
      <span className={`text-sm font-medium ${isOnline ? 'text-emerald-600' : 'text-gray-500'}`}>
        {isOnline ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
}

export default function DeviceHealth() {
  const { data: devices, isLoading: devicesLoading } = useDevices({})
  const { data: latestData, isLoading: telemetryLoading } = useAllLatestTelemetry()

  if (devicesLoading || telemetryLoading) return <LoadingSpinner />

  const latestMap = {}
  if (Array.isArray(latestData)) {
    latestData.forEach(r => { if (r.device_id) latestMap[r.device_id] = r })
  } else if (latestData && typeof latestData === 'object') {
    Object.entries(latestData).forEach(([id, r]) => { latestMap[Number(id)] = r })
  }

  const allDevices = devices || []
  const onlineCount = allDevices.filter(d => d.status === 'online').length
  const avgBattery = allDevices.filter(d => d.battery_level != null).reduce((s, d) => s + d.battery_level, 0) / (allDevices.length || 1)
  const avgLatency = allDevices.filter(d => d.latency_ms != null).reduce((s, d) => s + d.latency_ms, 0) / (allDevices.length || 1)
  const criticalCount = allDevices.filter(d => d.battery_level != null && d.battery_level < 20).length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Health Monitor</h1>
          <p className="text-sm text-gray-500">Real-time health metrics for all connected devices</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Online Devices</div>
              <div className="text-lg font-bold text-gray-900">{onlineCount}/{allDevices.length}</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Battery className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Avg Battery</div>
              <div className="text-lg font-bold text-gray-900">{avgBattery.toFixed(0)}%</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Avg Latency</div>
              <div className="text-lg font-bold text-gray-900">{avgLatency.toFixed(0)}ms</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Low Battery Alerts</div>
              <div className="text-lg font-bold text-gray-900">{criticalCount}</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="space-y-4">
        {allDevices.map((device) => {
          const reading = latestMap[device.id] || {}
          return (
            <motion.div key={device.id} variants={item}>
              <GlassCard hover={false}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{device.name}</h3>
                      <p className="text-[11px] text-gray-400">{device.location || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Battery Level</div>
                      <BatteryIndicator level={device.battery_level} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Signal Strength</div>
                      <SignalMeter strength={device.signal_strength} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Latency</div>
                      <LatencyMeter latency={device.latency_ms} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Health Score</div>
                      <HealthGauge score={reading.machine_health_score} />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 min-w-[120px]">
                    <ConnectionStatus device={device} />
                    <Badge variant={device.status} label={device.status} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {allDevices.length === 0 && (
        <motion.div variants={item}>
          <GlassCard hover={false}>
            <div className="text-center py-12">
              <Cpu className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No devices registered yet.</p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  )
}
