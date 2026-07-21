import { motion } from 'framer-motion'
import { Cpu, Thermometer, Zap, Shield, Clock, Activity, AlertTriangle } from 'lucide-react'
import { useLatestReadings } from '../hooks/useReadings'
import { useActiveAlerts } from '../hooks/useAlerts'
import StatCard from '../components/StatCard'
import ScoreGauge from '../components/ScoreGauge'
import RealTimeIndicator from '../components/RealTimeIndicator'
import ModuleTabBar from '../components/ModuleTabBar'
import VibrationChart from '../charts/VibrationChart'
import RiskTrendChart from '../charts/RiskTrendChart'
import CriticalAlerts from '../widgets/CriticalAlerts'
import { PageSkeleton } from '../components/LoadingSkeleton'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import { pageTransition } from '../animations/slideIn'
import clsx from 'clsx'

const mockVibrationData = Array.from({ length: 20 }, (_, i) => ({
  timestamp: new Date(Date.now() - (19 - i) * 300000).toISOString(),
  vibrationX: 2 + Math.random() * 3,
  vibrationY: 1.5 + Math.random() * 2.5,
  vibrationZ: 1 + Math.random() * 2,
}))

export default function MachineHealth() {
  const { data: readings = [], isLoading } = useLatestReadings()
  const { data: alerts = [] } = useActiveAlerts()
  const acknowledge = (id: string) => {}

  if (isLoading) return <PageSkeleton />

  const machineReadings = readings.filter((r) => (r.module || 'machine-health') === 'machine-health')
  const online = machineReadings.filter((r) => r.status !== 'OFFLINE').length
  const avgTemp = machineReadings.length ? (machineReadings.reduce((s, r) => s + r.temperature, 0) / machineReadings.length).toFixed(1) : '0.0'
  const avgRisk = machineReadings.length ? Math.round(machineReadings.reduce((s, r) => s + r.riskScore, 0) / machineReadings.length) : 0
  const healthScore = avgRisk > 0 ? 100 - avgRisk : 100
  const running = machineReadings.filter((r) => r.compressorOn).length
  const criticalAlerts = alerts.filter((a) => (a.module || 'machine-health') === 'machine-health' && (a.severity === 'CRITICAL' || a.severity === 'HIGH'))

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}><ModuleTabBar /></motion.div>

        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-machine-500/10"><Cpu className="w-6 h-6 text-machine-400" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Machine Health</h2>
              <p className="text-sm text-gray-400">Vibration analysis, predictive maintenance & runtime monitoring</p>
            </div>
          </div>
          <RealTimeIndicator />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<Cpu className="w-6 h-6" />} label="Total Machines" value={String(machineReadings.length)} color="purple" />
          <StatCard icon={<Thermometer className="w-6 h-6" />} label="Avg Temperature" value={`${avgTemp}°C`} color="blue" />
          <StatCard icon={<Shield className="w-6 h-6" />} label="Health Score" value={`${healthScore}%`} color={healthScore > 70 ? 'green' : healthScore > 40 ? 'amber' : 'red'} />
          <StatCard icon={<Activity className="w-6 h-6" />} label="Running" value={`${running}/${machineReadings.length}`} color="green" />
          <StatCard icon={<AlertTriangle className="w-6 h-6" />} label="Active Alerts" value={String(criticalAlerts.length)} color={criticalAlerts.length > 0 ? 'red' : 'green'} />
          <StatCard icon={<Clock className="w-6 h-6" />} label="Runtime" value={`${running > 0 ? Math.round((running / Math.max(machineReadings.length, 1)) * 100) : 0}%`} color="blue" />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 flex justify-center">
            <ScoreGauge score={healthScore} label="Machine Health Score" size="lg" />
          </div>
          <div className="lg:col-span-3">
            <VibrationChart data={mockVibrationData} />
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2"><RiskTrendChart readings={machineReadings} title="Failure Risk Trend" /></div>
          <div className="xl:col-span-1"><CriticalAlerts alerts={criticalAlerts} onAcknowledge={acknowledge} /></div>
        </motion.div>

        <motion.div variants={staggerItem}>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Machine Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {machineReadings.map((r, i) => (
                <motion.div key={r.deviceId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-200">{r.deviceId}</span>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full', r.status === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400' : r.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400' : r.status === 'CRITICAL' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400')}>{r.status}</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between"><span>Temperature</span><span>{r.temperature.toFixed(1)}°C</span></div>
                    <div className="flex justify-between"><span>Vibration</span><span>{(2 + Math.random() * 3).toFixed(1)} mm/s</span></div>
                    <div className="flex justify-between"><span>Current</span><span>{r.compressorCurrent.toFixed(1)}A</span></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
