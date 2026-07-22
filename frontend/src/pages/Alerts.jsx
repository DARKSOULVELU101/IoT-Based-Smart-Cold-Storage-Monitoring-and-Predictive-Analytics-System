import { motion } from 'framer-motion'
import { Bell, AlertTriangle, CheckCircle, XCircle, Filter } from 'lucide-react'
import { useState } from 'react'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAlerts, useAlertStats, useResolveAlert } from '../lib/hooks'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function Alerts() {
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showResolved, setShowResolved] = useState(false)

  const { data: alerts, isLoading } = useAlerts({ severity: filterSeverity, alert_type: filterType, is_resolved: showResolved })
  const { data: stats } = useAlertStats()
  const resolveAlert = useResolveAlert()

    if (isLoading) return <LoadingSpinner />

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500">Monitor and manage system alerts</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: stats?.total || 0, color: 'text-gray-900' },
          { label: 'Active', value: stats?.active || 0, color: 'text-red-600' },
          { label: 'Critical', value: stats?.by_severity?.critical || 0, color: 'text-red-500' },
          { label: 'High', value: stats?.by_severity?.high || 0, color: 'text-orange-500' },
        ].map((s, i) => (
          <GlassCard key={i}>
            <div className="text-xs text-gray-400 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </GlassCard>
        ))}
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap gap-3">
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Types</option>
          <option value="temperature">Temperature</option>
          <option value="humidity">Humidity</option>
          <option value="power">Power</option>
          <option value="gas">Gas</option>
          <option value="machine">Machine</option>
          <option value="water_quality">Water Quality</option>
          <option value="risk">Risk</option>
        </select>
        <Button
          variant={showResolved ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowResolved(!showResolved)}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          {showResolved ? 'Showing Resolved' : 'Show Resolved'}
        </Button>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        {(alerts || []).length === 0 ? (
          <GlassCard hover={false}>
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No alerts found</p>
            </div>
          </GlassCard>
        ) : (
          (alerts || []).map((alert) => (
            <GlassCard key={alert.id} hover={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    alert.severity === 'critical' ? 'bg-red-50' :
                    alert.severity === 'high' ? 'bg-orange-50' :
                    alert.severity === 'medium' ? 'bg-amber-50' : 'bg-blue-50'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.severity === 'critical' ? 'text-red-500' :
                      alert.severity === 'high' ? 'text-orange-500' :
                      alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{alert.message}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {alert.device_name} &middot; {alert.alert_type} &middot; {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={alert.severity} label={alert.severity} />
                  {!alert.is_resolved && (
                    <Button variant="ghost" size="sm" onClick={() => resolveAlert.mutate(alert.id)}>
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </motion.div>
    </motion.div>
  )
}
