import { motion } from 'framer-motion'
import { Droplet, Thermometer, Activity, Shield, Gauge, Waves } from 'lucide-react'
import { useLatestReadings } from '../hooks/useReadings'
import { useActiveAlerts } from '../hooks/useAlerts'
import StatCard from '../components/StatCard'
import ScoreGauge from '../components/ScoreGauge'
import RealTimeIndicator from '../components/RealTimeIndicator'
import ModuleTabBar from '../components/ModuleTabBar'
import PHChart from '../charts/PHChart'
import TDSChart from '../charts/TDSChart'
import RiskTrendChart from '../charts/RiskTrendChart'
import CriticalAlerts from '../widgets/CriticalAlerts'
import { PageSkeleton } from '../components/LoadingSkeleton'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import { pageTransition } from '../animations/slideIn'

const mockPHData = Array.from({ length: 20 }, (_, i) => ({
  timestamp: new Date(Date.now() - (19 - i) * 300000).toISOString(),
  ph: 6.8 + Math.random() * 1.4,
}))

const mockTDSData = Array.from({ length: 20 }, (_, i) => ({
  timestamp: new Date(Date.now() - (19 - i) * 300000).toISOString(),
  tds: 150 + Math.random() * 200,
}))

export default function WaterQuality() {
  const { data: readings = [], isLoading } = useLatestReadings()
  const { data: alerts = [] } = useActiveAlerts()
  const acknowledge = (id: string) => {}

  if (isLoading) return <PageSkeleton />

  const waterReadings = readings.filter((r) => (r.module || 'water-quality') === 'water-quality')
  const avgTemp = waterReadings.length ? (waterReadings.reduce((s, r) => s + r.temperature, 0) / waterReadings.length).toFixed(1) : '0.0'
  const avgRisk = waterReadings.length ? Math.round(waterReadings.reduce((s, r) => s + r.riskScore, 0) / waterReadings.length) : 0
  const qualityScore = avgRisk > 0 ? 100 - avgRisk : 100
  const avgPH = mockPHData.length ? (mockPHData.reduce((s, d) => s + d.ph, 0) / mockPHData.length).toFixed(1) : '7.0'
  const avgTDS = mockTDSData.length ? Math.round(mockTDSData.reduce((s, d) => s + d.tds, 0) / mockTDSData.length) : 0
  const criticalAlerts = alerts.filter((a) => (a.module || 'water-quality') === 'water-quality' && (a.severity === 'CRITICAL' || a.severity === 'HIGH'))

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}><ModuleTabBar /></motion.div>

        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-water-500/10"><Droplet className="w-6 h-6 text-water-400" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Water Quality</h2>
              <p className="text-sm text-gray-400">pH monitoring, TDS analysis & contamination risk</p>
            </div>
          </div>
          <RealTimeIndicator />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<Droplet className="w-6 h-6" />} label="Quality Score" value={`${qualityScore}%`} color="cyan" />
          <StatCard icon={<Gauge className="w-6 h-6" />} label="Avg pH" value={avgPH} color={parseFloat(avgPH) >= 6.5 && parseFloat(avgPH) <= 8.5 ? 'green' : 'amber'} />
          <StatCard icon={<Activity className="w-6 h-6" />} label="Avg TDS" value={`${avgTDS} ppm`} color={avgTDS < 300 ? 'green' : avgTDS < 500 ? 'amber' : 'red'} />
          <StatCard icon={<Thermometer className="w-6 h-6" />} label="Water Temp" value={`${avgTemp}°C`} color="blue" />
          <StatCard icon={<Waves className="w-6 h-6" />} label="Flow Rate" value={`${(10 + Math.random() * 5).toFixed(1)} L/m`} color="blue" />
          <StatCard icon={<Shield className="w-6 h-6" />} label="Contamination" value={avgRisk > 50 ? 'High' : avgRisk > 25 ? 'Medium' : 'Low'} color={avgRisk > 50 ? 'red' : avgRisk > 25 ? 'amber' : 'green'} />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 flex justify-center">
            <ScoreGauge score={qualityScore} label="Water Quality Index" size="lg" />
          </div>
          <div className="lg:col-span-3">
            <PHChart data={mockPHData} />
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TDSChart data={mockTDSData} />
          <RiskTrendChart readings={waterReadings} title="Contamination Risk Trend" />
        </motion.div>

        <motion.div variants={staggerItem}>
          <CriticalAlerts alerts={criticalAlerts} onAcknowledge={acknowledge} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
