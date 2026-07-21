import { motion } from 'framer-motion'
import { Thermometer, Droplets, Zap, Shield, DoorOpen, Activity, Snowflake } from 'lucide-react'
import { useLatestReadings } from '../hooks/useReadings'
import { useActiveAlerts } from '../hooks/useAlerts'
import StatCard from '../components/StatCard'
import AnimatedCounter from '../components/AnimatedCounter'
import ScoreGauge from '../components/ScoreGauge'
import RealTimeIndicator from '../components/RealTimeIndicator'
import ModuleTabBar from '../components/ModuleTabBar'
import RealtimeLineChart from '../charts/RealtimeLineChart'
import RiskTrendChart from '../charts/RiskTrendChart'
import DoorActivityChart from '../charts/DoorActivityChart'
import CompressorChart from '../charts/CompressorChart'
import HeatmapChart from '../charts/HeatmapChart'
import CriticalAlerts from '../widgets/CriticalAlerts'
import { PageSkeleton } from '../components/LoadingSkeleton'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import { pageTransition } from '../animations/slideIn'
import clsx from 'clsx'

export default function ColdStorage() {
  const { data: readings = [], isLoading } = useLatestReadings()
  const { data: alerts = [] } = useActiveAlerts()
  const acknowledge = (id: string) => {}

  if (isLoading) return <PageSkeleton />

  const coldReadings = readings.filter((r) => (r.module || 'cold-storage') === 'cold-storage')
  const online = coldReadings.filter((r) => r.status !== 'OFFLINE').length
  const avgTemp = coldReadings.length ? (coldReadings.reduce((s, r) => s + r.temperature, 0) / coldReadings.length).toFixed(1) : '0.0'
  const avgRisk = coldReadings.length ? Math.round(coldReadings.reduce((s, r) => s + r.riskScore, 0) / coldReadings.length) : 0
  const doorsOpen = coldReadings.filter((r) => r.doorOpen).length
  const compressorsOn = coldReadings.filter((r) => r.compressorOn).length
  const criticalAlerts = alerts.filter((a) => (a.module || 'cold-storage') === 'cold-storage' && (a.severity === 'CRITICAL' || a.severity === 'HIGH'))

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}><ModuleTabBar /></motion.div>

        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cold-500/10"><Snowflake className="w-6 h-6 text-cold-400" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Cold Storage</h2>
              <p className="text-sm text-gray-400">Temperature monitoring & cold chain compliance</p>
            </div>
          </div>
          <RealTimeIndicator />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<Thermometer className="w-6 h-6" />} label="Avg Temp" value={`${avgTemp}°C`} color="blue" />
          <StatCard icon={<Droplets className="w-6 h-6" />} label="Avg Humidity" value={`${coldReadings.length ? (coldReadings.reduce((s, r) => s + r.humidity, 0) / coldReadings.length).toFixed(1) : '0'}%`} color="cyan" />
          <StatCard icon={<Shield className="w-6 h-6" />} label="Risk Score" value={String(avgRisk)} color={avgRisk > 70 ? 'red' : avgRisk > 40 ? 'amber' : 'green'} />
          <StatCard icon={<DoorOpen className="w-6 h-6" />} label="Doors Open" value={String(doorsOpen)} color={doorsOpen > 0 ? 'red' : 'green'} />
          <StatCard icon={<Activity className="w-6 h-6" />} label="Compressors" value={`${compressorsOn}/${coldReadings.length}`} color="blue" />
          <StatCard icon={<Zap className="w-6 h-6" />} label="Power Loss" value={String(coldReadings.filter((r) => !r.powerAvailable).length)} color="red" />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 flex justify-center">
            <ScoreGauge score={avgRisk > 0 ? 100 - avgRisk : 100} label="Cold Chain Compliance" size="lg" />
          </div>
          <div className="lg:col-span-3">
            <RealtimeLineChart readings={coldReadings} title="Temperature & Humidity - Cold Storage" />
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DoorActivityChart readings={coldReadings} />
          <CompressorChart readings={coldReadings} />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2"><RiskTrendChart readings={coldReadings} /></div>
          <div className="xl:col-span-1"><CriticalAlerts alerts={criticalAlerts} onAcknowledge={acknowledge} /></div>
        </motion.div>

        {coldReadings.length > 0 && (
          <motion.div variants={staggerItem}>
            <HeatmapChart readings={coldReadings} title="Temperature Heatmap - Cold Storage" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
