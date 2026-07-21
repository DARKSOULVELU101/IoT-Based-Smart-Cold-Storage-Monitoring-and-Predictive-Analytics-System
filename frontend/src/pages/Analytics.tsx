import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Brain, Zap, Download, Calendar } from 'lucide-react'
import { useAnalytics, usePredictions, useZoneComparison, useModuleComparison } from '../hooks/useAnalytics'
import { useLatestReadings } from '../hooks/useReadings'
import ZoneComparisonChart from '../charts/ZoneComparisonChart'
import ModuleComparisonChart from '../charts/ModuleComparisonChart'
import RiskTrendChart from '../charts/RiskTrendChart'
import HeatmapChart from '../charts/HeatmapChart'
import ModuleTabBar from '../components/ModuleTabBar'
import { PageSkeleton } from '../components/LoadingSkeleton'
import { pageTransition } from '../animations/slideIn'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import clsx from 'clsx'

const trendIcons: Record<string, string> = { increasing: '↑', decreasing: '↓', stable: '→' }
const trendColors: Record<string, string> = { increasing: 'text-red-400', decreasing: 'text-emerald-400', stable: 'text-gray-400' }

export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics()
  const { data: readings = [], isLoading: readingsLoading } = useLatestReadings()
  const { data: zoneComparison = [] } = useZoneComparison()
  const { data: predictions = [] } = usePredictions()
  const { data: moduleComparison } = useModuleComparison()

  if (analyticsLoading || readingsLoading) return <PageSkeleton />

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}><ModuleTabBar /></motion.div>

        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Cross-Module Analytics</h2>
            <p className="text-sm text-gray-400">Comprehensive analytics across all IoT modules</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary"><Calendar className="w-4 h-4" /> Last 7 Days</button>
            <button className="btn-primary"><Download className="w-4 h-4" /> Export</button>
          </div>
        </motion.div>

        {analytics && (
          <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <p className="text-xs text-gray-500 mb-1">Storage Efficiency</p>
              <p className="text-2xl font-bold text-gray-100">{analytics.storageEfficiency?.toFixed(1) || 'N/A'}%</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs text-gray-500 mb-1">Energy Consumption</p>
              <p className="text-2xl font-bold text-gray-100">{analytics.energyConsumption?.toFixed(1) || 'N/A'} kWh</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs text-gray-500 mb-1">Avg Risk Score</p>
              <p className={clsx('text-2xl font-bold', (analytics.avgRiskScore || 0) > 70 ? 'text-red-400' : (analytics.avgRiskScore || 0) > 40 ? 'text-amber-400' : 'text-emerald-400')}>
                {analytics.avgRiskScore?.toFixed(1) || 'N/A'}
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs text-gray-500 mb-1">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-100">{analytics.totalAlerts || 0}</p>
            </div>
          </motion.div>
        )}

        {moduleComparison && (
          <motion.div variants={staggerItem}>
            <ModuleComparisonChart data={moduleComparison} />
          </motion.div>
        )}

        {zoneComparison.length > 0 && (
          <motion.div variants={staggerItem}><ZoneComparisonChart zones={zoneComparison} /></motion.div>
        )}

        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskTrendChart readings={readings} />
          {readings.length > 0 && <HeatmapChart readings={readings} />}
        </motion.div>

        {predictions.length > 0 && (
          <motion.div variants={staggerItem}>
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-semibold text-gray-300">Predictive Analytics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictions.map((pred, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-400 capitalize">{pred.metric}</span>
                      <span className={clsx('text-sm font-bold', trendColors[pred.trend])}>{trendIcons[pred.trend]} {pred.trend}</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-bold text-gray-100">{pred.predictedValue.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">predicted</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Current: {pred.currentValue.toFixed(1)}</span>
                      <span>Confidence: {(pred.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1 mb-2">
                      <div className="h-1 rounded-full bg-cold-500" style={{ width: `${pred.confidence * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">{pred.recommendation}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={staggerItem}>
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-gray-300">Energy Consumption Analysis</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50">
                <p className="text-xs text-gray-500 mb-1">Current Draw</p>
                <p className="text-xl font-bold text-gray-100">{readings.length ? (readings.reduce((sum, r) => sum + r.compressorCurrent, 0) / readings.length).toFixed(1) : '0'}A</p>
                <p className="text-xs text-gray-500">Avg across all units</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50">
                <p className="text-xs text-gray-500 mb-1">Compressor Uptime</p>
                <p className="text-xl font-bold text-gray-100">{readings.length ? Math.round((readings.filter((r) => r.compressorOn).length / readings.length) * 100) : 0}%</p>
                <p className="text-xs text-gray-500">Running time ratio</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50">
                <p className="text-xs text-gray-500 mb-1">Power Incidents</p>
                <p className="text-xl font-bold text-gray-100">{readings.filter((r) => !r.powerAvailable).length}</p>
                <p className="text-xs text-gray-500">Power loss events</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
