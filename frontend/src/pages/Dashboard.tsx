import { motion } from 'framer-motion'
import { Server, Thermometer, AlertTriangle, Shield, TrendingUp, Activity } from 'lucide-react'
import { useLatestReadings } from '../hooks/useReadings'
import { useActiveAlerts } from '../hooks/useAlerts'
import { useAnalytics } from '../hooks/useAnalytics'
import StatCard from '../components/StatCard'
import AnimatedCounter from '../components/AnimatedCounter'
import ModuleTabBar from '../components/ModuleTabBar'
import RealTimeIndicator from '../components/RealTimeIndicator'
import RealtimeLineChart from '../charts/RealtimeLineChart'
import RiskTrendChart from '../charts/RiskTrendChart'
import ModuleOverview from '../widgets/ModuleOverview'
import DeviceOverview from '../widgets/DeviceOverview'
import CriticalAlerts from '../widgets/CriticalAlerts'
import SystemHealth from '../widgets/SystemHealth'
import RecentActivity from '../widgets/RecentActivity'
import { PageSkeleton } from '../components/LoadingSkeleton'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import { pageTransition } from '../animations/slideIn'
import { useAcknowledgeAlert } from '../hooks/useAlerts'
import { motion as m } from 'framer-motion'

export default function Dashboard() {
  const { data: readings = [], isLoading: readingsLoading } = useLatestReadings()
  const { data: activeAlerts = [], isLoading: alertsLoading } = useActiveAlerts()
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics()
  const acknowledgeMutation = useAcknowledgeAlert()

  if (readingsLoading || analyticsLoading) return <PageSkeleton />

  const onlineCount = readings.filter((r) => r.status !== 'OFFLINE').length
  const avgTemp = readings.length ? (readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length).toFixed(1) : '0.0'
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH')
  const avgRisk = readings.length ? Math.round(readings.reduce((sum, r) => sum + r.riskScore, 0) / readings.length) : 0

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}>
          <ModuleTabBar />
        </motion.div>

        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100">System Overview</h2>
            <p className="text-sm text-gray-400">Enterprise IoT Analytics Dashboard</p>
          </div>
          <RealTimeIndicator />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Server className="w-6 h-6" />} label="Total Devices" value={
            <span className="flex items-baseline gap-1">
              <AnimatedCounter value={onlineCount} />
              <span className="text-base text-gray-500">/{readings.length}</span>
            </span>
          } color="green" />
          <StatCard icon={<Thermometer className="w-6 h-6" />} label="Avg Temperature" value={`${avgTemp}°C`} color="blue" />
          <StatCard icon={<AlertTriangle className="w-6 h-6" />} label="Active Alerts" value={<AnimatedCounter value={activeAlerts.length} />} color={activeAlerts.length > 0 ? 'amber' : 'green'} />
          <StatCard icon={<Shield className="w-6 h-6" />} label="Avg Risk Score" value={<AnimatedCounter value={avgRisk} />} color={avgRisk > 70 ? 'red' : avgRisk > 40 ? 'amber' : 'green'} />
        </motion.div>

        <motion.div variants={staggerItem}>
          <ModuleOverview moduleStats={analytics?.moduleStats} />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2"><RealtimeLineChart readings={readings} /></div>
          <div><SystemHealth readings={readings} /></div>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1"><DeviceOverview readings={readings} /></div>
          <div className="xl:col-span-1"><RiskTrendChart readings={readings} /></div>
          <div className="xl:col-span-1"><CriticalAlerts alerts={criticalAlerts} onAcknowledge={(id) => acknowledgeMutation.mutate(id)} /></div>
        </motion.div>

        <motion.div variants={staggerItem}>
          <RecentActivity />
        </motion.div>

        {analytics?.zones && analytics.zones.length > 0 && (
          <motion.div variants={staggerItem}>
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Zone Status Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.zones.map((zone, index) => (
                  <m.div key={zone.zone} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50">
                    <h4 className="font-medium text-gray-200 mb-2">{zone.zone}</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex justify-between"><span>Devices</span><span>{zone.onlineCount}/{zone.deviceCount}</span></div>
                      <div className="flex justify-between"><span>Temperature</span><span>{zone.avgTemperature.toFixed(1)}°C</span></div>
                      <div className="flex justify-between"><span>Risk Score</span>
                        <span className={zone.avgRiskScore > 70 ? 'text-red-400' : zone.avgRiskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}>
                          {zone.avgRiskScore.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </m.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
