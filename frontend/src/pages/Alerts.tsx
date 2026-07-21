import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Filter, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAlerts, useAcknowledgeAlert, useDeleteAlert } from '../hooks/useAlerts'
import AlertItem from '../components/AlertItem'
import ModuleTabBar from '../components/ModuleTabBar'
import { PageSkeleton } from '../components/LoadingSkeleton'
import { pageTransition } from '../animations/slideIn'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import clsx from 'clsx'

const severityOptions = ['All', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function Alerts() {
  const [severityFilter, setSeverityFilter] = useState('All')
  const [acknowledgedFilter, setAcknowledgedFilter] = useState<'all' | 'acknowledged' | 'unacknowledged'>('all')
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set())
  const { data: alerts = [], isLoading } = useAlerts()
  const acknowledgeMutation = useAcknowledgeAlert()
  const deleteMutation = useDeleteAlert()

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter
      const matchesAck = acknowledgedFilter === 'all' || (acknowledgedFilter === 'acknowledged' && alert.acknowledged) || (acknowledgedFilter === 'unacknowledged' && !alert.acknowledged)
      return matchesSeverity && matchesAck
    })
  }, [alerts, severityFilter, acknowledgedFilter])

  const alertStats = useMemo(() => ({
    critical: alerts.filter((a) => a.severity === 'CRITICAL' && !a.acknowledged).length,
    high: alerts.filter((a) => a.severity === 'HIGH' && !a.acknowledged).length,
    medium: alerts.filter((a) => a.severity === 'MEDIUM' && !a.acknowledged).length,
    low: alerts.filter((a) => a.severity === 'LOW' && !a.acknowledged).length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
  }), [alerts])

  const toggleSelectAll = () => {
    if (selectedAlerts.size === filteredAlerts.length) setSelectedAlerts(new Set())
    else setSelectedAlerts(new Set(filteredAlerts.map((a) => a.id)))
  }

  const batchAcknowledge = () => {
    selectedAlerts.forEach((id) => acknowledgeMutation.mutate(id))
    setSelectedAlerts(new Set())
  }

  if (isLoading) return <PageSkeleton />

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}><ModuleTabBar /></motion.div>

        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Alert Management</h2>
            <p className="text-sm text-gray-400">{alertStats.unacknowledged} unacknowledged alerts</p>
          </div>
          {selectedAlerts.size > 0 && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={batchAcknowledge} className="btn-success">
              <CheckCircle className="w-4 h-4" /> Acknowledge ({selectedAlerts.size})
            </motion.button>
          )}
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Critical', count: alertStats.critical, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'High', count: alertStats.high, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'Medium', count: alertStats.medium, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Low', count: alertStats.low, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={clsx('glass-card p-4 flex items-center gap-3', stat.bg)}>
              <AlertTriangle className={clsx('w-5 h-5', stat.color)} />
              <div>
                <p className="text-2xl font-bold text-gray-100">{stat.count}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Severity:</span>
            <div className="flex flex-wrap gap-1">
              {severityOptions.map((severity) => (
                <button key={severity} onClick={() => setSeverityFilter(severity)}
                  className={clsx('px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
                    severityFilter === severity ? 'bg-cold-500/20 text-cold-400 border border-cold-500/30' : 'bg-gray-800/50 text-gray-400 border border-transparent hover:text-gray-200')}>
                  {severity}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-sm text-gray-400">Status:</span>
            <select value={acknowledgedFilter} onChange={(e) => setAcknowledgedFilter(e.target.value as typeof acknowledgedFilter)} className="select-field w-auto">
              <option value="all">All</option><option value="unacknowledged">Unacknowledged</option><option value="acknowledged">Acknowledged</option>
            </select>
          </div>
        </motion.div>

        {filteredAlerts.length > 0 && (
          <motion.div variants={staggerItem} className="flex items-center gap-3">
            <button onClick={toggleSelectAll} className={clsx('flex items-center gap-2 text-sm transition-colors', selectedAlerts.size === filteredAlerts.length ? 'text-cold-400' : 'text-gray-500 hover:text-gray-300')}>
              <div className={clsx('w-4 h-4 rounded border transition-colors', selectedAlerts.size === filteredAlerts.length ? 'bg-cold-500 border-cold-500' : 'border-gray-600')} />Select All
            </button>
            <span className="text-xs text-gray-500">{filteredAlerts.length} alerts</span>
          </motion.div>
        )}

        <motion.div variants={staggerItem} className="space-y-2">
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No alerts matching filters</p>
                <p className="text-sm text-gray-500 mt-1">All clear!</p>
              </motion.div>
            ) : (
              filteredAlerts.map((alert, index) => (
                <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.03 }} className="flex items-center gap-3">
                  <button onClick={() => { const next = new Set(selectedAlerts); if (next.has(alert.id)) next.delete(alert.id); else next.add(alert.id); setSelectedAlerts(next) }}
                    className={clsx('w-4 h-4 rounded border transition-colors flex-shrink-0', selectedAlerts.has(alert.id) ? 'bg-cold-500 border-cold-500' : 'border-gray-600')} />
                  <div className="flex-1">
                    <AlertItem alert={alert} onAcknowledge={(id) => acknowledgeMutation.mutate(id)} onDelete={(id) => deleteMutation.mutate(id)} index={index} />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
