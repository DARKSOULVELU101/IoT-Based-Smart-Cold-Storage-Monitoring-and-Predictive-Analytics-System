import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Thermometer, Droplets, Wind, Zap, Shield, DoorOpen, Activity, Power, PowerOff, Trash2, Cpu, Droplet, Warehouse, Wrench } from 'lucide-react'
import { useReadingsByDevice } from '../hooks/useReadings'
import { useDevice, useEnableDevice, useDisableDevice, useDeleteDevice } from '../hooks/useDevices'
import { useAlerts } from '../hooks/useAlerts'
import StatusBadge from '../components/StatusBadge'
import RealtimeLineChart from '../charts/RealtimeLineChart'
import RiskTrendChart from '../charts/RiskTrendChart'
import AlertItem from '../components/AlertItem'
import { ChartSkeleton, PageSkeleton } from '../components/LoadingSkeleton'
import { pageTransition } from '../animations/slideIn'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import { format } from 'date-fns'
import clsx from 'clsx'

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: device, isLoading: deviceLoading } = useDevice(id || '')
  const { data: readings = [], isLoading: readingsLoading } = useReadingsByDevice(id || '', { limit: 50 })
  const { data: alerts = [] } = useAlerts({ device_id: id })
  const enableMutation = useEnableDevice()
  const disableMutation = useDisableDevice()
  const deleteMutation = useDeleteDevice()

  if (deviceLoading || readingsLoading) return <PageSkeleton />

  const latestReading = readings[0]
  if (!latestReading) {
    return (
      <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
        <button onClick={() => navigate('/devices')} className="btn-secondary mb-4"><ArrowLeft className="w-4 h-4" /> Back to Devices</button>
        <div className="glass-card p-12 text-center"><p className="text-gray-400">No readings available for this device</p></div>
      </motion.div>
    )
  }

  const moduleType = latestReading.module || 'cold-storage'
  const moduleIcons: Record<string, typeof Thermometer> = { 'cold-storage': Thermometer, 'machine-health': Cpu, 'water-quality': Droplet, 'warehouse': Warehouse }

  const readingMetrics = [
    { icon: Thermometer, label: 'Temperature', value: `${latestReading.temperature.toFixed(1)}°C`, color: 'text-cold-400', bgColor: 'bg-cold-500/10' },
    { icon: Droplets, label: 'Humidity', value: `${latestReading.humidity.toFixed(1)}%`, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { icon: Wind, label: 'Gas Level', value: `${latestReading.gasLevel} ppm`, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { icon: Zap, label: 'Current', value: `${latestReading.compressorCurrent.toFixed(1)}A`, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    { icon: Shield, label: 'Risk Score', value: `${latestReading.riskScore}/100`, color: latestReading.riskScore > 70 ? 'text-red-400' : latestReading.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400', bgColor: latestReading.riskScore > 70 ? 'bg-red-500/10' : latestReading.riskScore > 40 ? 'bg-amber-500/10' : 'bg-emerald-500/10' },
    { icon: DoorOpen, label: 'Door', value: latestReading.doorOpen ? 'OPEN' : 'CLOSED', color: latestReading.doorOpen ? 'text-red-400' : 'text-emerald-400', bgColor: latestReading.doorOpen ? 'bg-red-500/10' : 'bg-emerald-500/10' },
  ]

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}>
          <button onClick={() => navigate('/devices')} className="btn-secondary mb-2"><ArrowLeft className="w-4 h-4" /> Back to Devices</button>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-100">{latestReading.deviceId}</h2>
                <StatusBadge status={latestReading.status} />
              </div>
              <p className="text-sm text-gray-400">Zone: {latestReading.zone} • Module: {moduleType.replace('-', ' ')} • Last update: {latestReading.timestamp ? format(new Date(latestReading.timestamp), 'MMM d, yyyy HH:mm:ss') : 'N/A'}</p>
            </div>
            <div className="flex items-center gap-2">
              {device?.enabled !== false ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => id && disableMutation.mutate(id)} className="btn-secondary">
                  <PowerOff className="w-4 h-4" /> Disable
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => id && enableMutation.mutate(id)} className="btn-success">
                  <Power className="w-4 h-4" /> Enable
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => {
                if (id && confirm('Are you sure you want to delete this device?')) {
                  deleteMutation.mutate(id, { onSuccess: () => navigate('/devices') })
                }
              }} className="btn-danger"><Trash2 className="w-4 h-4" /> Delete</motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {readingMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-card p-4 text-center">
                <div className={clsx('p-2 rounded-lg mx-auto w-fit mb-2', metric.bgColor)}><Icon className={clsx('w-5 h-5', metric.color)} /></div>
                <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                <p className="text-lg font-bold text-gray-100">{metric.value}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
          <div className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm', latestReading.compressorOn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400')}>
            <Activity className="w-4 h-4" /> Compressor: {latestReading.compressorOn ? 'ON' : 'OFF'}
          </div>
          <div className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm', latestReading.powerAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
            <Zap className="w-4 h-4" /> Power: {latestReading.powerAvailable ? 'Available' : 'Lost'}
          </div>
          {latestReading.doorOpen && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-red-500/10 text-red-400">
              <DoorOpen className="w-4 h-4" /> Door open for {latestReading.doorOpenSeconds}s
            </div>
          )}
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealtimeLineChart readings={readings} title="Temperature & Humidity History" />
          <RiskTrendChart readings={readings} title="Risk Score History" />
        </motion.div>

        {alerts.length > 0 && (
          <motion.div variants={staggerItem}>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Alert History</h3>
            <div className="space-y-2">
              {alerts.slice(0, 10).map((alert, index) => (
                <AlertItem key={alert.id} alert={alert} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
