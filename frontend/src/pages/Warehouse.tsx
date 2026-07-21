import { motion } from 'framer-motion'
import { Warehouse, Thermometer, Droplets, Shield, Users, Wind, Eye } from 'lucide-react'
import { useLatestReadings } from '../hooks/useReadings'
import { useActiveAlerts } from '../hooks/useAlerts'
import StatCard from '../components/StatCard'
import ScoreGauge from '../components/ScoreGauge'
import RealTimeIndicator from '../components/RealTimeIndicator'
import ModuleTabBar from '../components/ModuleTabBar'
import OccupancyChart from '../charts/OccupancyChart'
import AirQualityChart from '../charts/AirQualityChart'
import StorageUtilizationChart from '../charts/StorageUtilizationChart'
import RiskTrendChart from '../charts/RiskTrendChart'
import CriticalAlerts from '../widgets/CriticalAlerts'
import { PageSkeleton } from '../components/LoadingSkeleton'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import { pageTransition } from '../animations/slideIn'

const mockOccupancy = [
  { zone: 'Zone A', current: 45, capacity: 60 },
  { zone: 'Zone B', current: 32, capacity: 50 },
  { zone: 'Zone C', current: 55, capacity: 55 },
  { zone: 'Zone D', current: 20, capacity: 40 },
]

const mockAQI = Array.from({ length: 20 }, (_, i) => ({
  timestamp: new Date(Date.now() - (19 - i) * 300000).toISOString(),
  aqi: 30 + Math.random() * 80,
  pm25: 10 + Math.random() * 30,
}))

const mockStorage = [
  { zone: 'Rack A', used: 450, total: 500 },
  { zone: 'Rack B', used: 320, total: 400 },
  { zone: 'Rack C', used: 280, total: 350 },
  { zone: 'Rack D', used: 150, total: 300 },
]

export default function Warehouse() {
  const { data: readings = [], isLoading } = useLatestReadings()
  const { data: alerts = [] } = useActiveAlerts()
  const acknowledge = (id: string) => {}

  if (isLoading) return <PageSkeleton />

  const whReadings = readings.filter((r) => (r.module || 'warehouse') === 'warehouse')
  const avgTemp = whReadings.length ? (whReadings.reduce((s, r) => s + r.temperature, 0) / whReadings.length).toFixed(1) : '0.0'
  const avgHumidity = whReadings.length ? (whReadings.reduce((s, r) => s + r.humidity, 0) / whReadings.length).toFixed(1) : '0.0'
  const avgRisk = whReadings.length ? Math.round(whReadings.reduce((s, r) => s + r.riskScore, 0) / whReadings.length) : 0
  const environmentScore = avgRisk > 0 ? 100 - avgRisk : 100
  const totalOccupancy = mockOccupancy.reduce((s, z) => s + z.current, 0)
  const totalCapacity = mockOccupancy.reduce((s, z) => s + z.capacity, 0)
  const criticalAlerts = alerts.filter((a) => (a.module || 'warehouse') === 'warehouse' && (a.severity === 'CRITICAL' || a.severity === 'HIGH'))

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}><ModuleTabBar /></motion.div>

        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-warehouse-500/10"><Warehouse className="w-6 h-6 text-warehouse-400" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Warehouse</h2>
              <p className="text-sm text-gray-400">Occupancy, environment monitoring & storage analytics</p>
            </div>
          </div>
          <RealTimeIndicator />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<Warehouse className="w-6 h-6" />} label="Occupancy" value={`${totalOccupancy}/${totalCapacity}`} color="orange" />
          <StatCard icon={<Thermometer className="w-6 h-6" />} label="Avg Temp" value={`${avgTemp}°C`} color="blue" />
          <StatCard icon={<Droplets className="w-6 h-6" />} label="Avg Humidity" value={`${avgHumidity}%`} color="cyan" />
          <StatCard icon={<Wind className="w-6 h-6" />} label="Air Quality" value={`AQI ${Math.round(mockAQI[mockAQI.length - 1]?.aqi || 0)}`} color={mockAQI[mockAQI.length - 1]?.aqi > 100 ? 'amber' : 'green'} />
          <StatCard icon={<Eye className="w-6 h-6" />} label="Motion Events" value={String(Math.floor(Math.random() * 15))} color="purple" />
          <StatCard icon={<Shield className="w-6 h-6" />} label="Safety Score" value={`${environmentScore}%`} color={environmentScore > 70 ? 'green' : 'amber'} />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 flex justify-center">
            <ScoreGauge score={environmentScore} label="Environment Score" size="lg" />
          </div>
          <div className="lg:col-span-3">
            <OccupancyChart data={mockOccupancy} />
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AirQualityChart data={mockAQI} />
          <StorageUtilizationChart data={mockStorage} />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2"><RiskTrendChart readings={whReadings} title="Warehouse Risk Trend" /></div>
          <div className="xl:col-span-1"><CriticalAlerts alerts={criticalAlerts} onAcknowledge={acknowledge} /></div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
