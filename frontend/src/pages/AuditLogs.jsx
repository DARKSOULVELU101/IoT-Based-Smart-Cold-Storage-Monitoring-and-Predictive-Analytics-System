import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  FileText, Search, Filter, Download, Clock, User, Shield,
  ChevronLeft, ChevronRight, Activity, AlertTriangle
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuditLogs, useAuditStats } from '../lib/hooks'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const actionColors = {
  create: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  update: 'bg-blue-50 text-blue-600 border border-blue-200',
  delete: 'bg-red-50 text-red-600 border border-red-200',
  login: 'bg-purple-50 text-purple-600 border border-purple-200',
  logout: 'bg-gray-50 text-gray-600 border border-gray-200',
  enable: 'bg-cyan-50 text-cyan-600 border border-cyan-200',
  disable: 'bg-orange-50 text-orange-600 border border-orange-200',
  seed: 'bg-amber-50 text-amber-600 border border-amber-200',
}

const actionIcons = {
  create: Activity,
  update: FileText,
  delete: AlertTriangle,
  login: User,
  logout: User,
  enable: Shield,
  disable: Shield,
  seed: Activity,
}

function ActionBadge({ action }) {
  const colors = actionColors[action] || 'bg-gray-50 text-gray-600 border border-gray-200'
  const Icon = actionIcons[action] || Activity
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors}`}>
      <Icon className="w-3 h-3" />
      {action}
    </span>
  )
}

export default function AuditLogs() {
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20

  const { data: stats, isLoading: statsLoading } = useAuditStats()
  const { data: allLogs, isLoading: logsLoading } = useAuditLogs({
    action: actionFilter || undefined,
    entity_type: entityFilter || undefined,
    limit: 500,
  })

  if (statsLoading || logsLoading) return <LoadingSpinner />

  const logs = Array.isArray(allLogs) ? allLogs : []
  const filtered = logs.filter(log => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      log.username?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      log.entity_type?.toLowerCase().includes(term) ||
      log.ip_address?.toLowerCase().includes(term) ||
      JSON.stringify(log.details || {}).toLowerCase().includes(term)
    )
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const uniqueActions = [...new Set(logs.map(l => l.action))].sort()
  const uniqueEntities = [...new Set(logs.map(l => l.entity_type))].sort()

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500">Track all system activities and user actions</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Total Events</div>
              <div className="text-lg font-bold text-gray-900">{stats?.total || 0}</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Actions Tracked</div>
              <div className="text-lg font-bold text-gray-900">{Object.keys(stats?.by_action || {}).length}</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Entity Types</div>
              <div className="text-lg font-bold text-gray-900">{Object.keys(stats?.by_entity || {}).length}</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {stats?.by_action && Object.keys(stats.by_action).length > 0 && (
        <motion.div variants={item}>
          <GlassCard hover={false}>
            <h3 className="font-semibold text-gray-900 mb-3">Events by Action</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.by_action).sort((a, b) => b[1] - a[1]).map(([action, count]) => (
                <div key={action} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                  <ActionBadge action={action} />
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      <motion.div variants={item} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
            placeholder="Search logs by user, action, entity, IP..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Entities</option>
          {uniqueEntities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log, idx) => (
                  <motion.tr
                    key={log.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-[10px] font-bold text-primary-600">
                          {log.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{log.username}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600">{log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ''}</span>
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      {log.details ? (
                        <div className="text-xs text-gray-500 truncate" title={JSON.stringify(log.details)}>
                          {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-gray-400">{log.ip_address}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {paginated.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No audit logs found</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <span className="text-xs text-gray-500">Page {page}/{totalPages}</span>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
