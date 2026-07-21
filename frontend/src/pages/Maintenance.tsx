import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Plus, Clock, CheckCircle, AlertTriangle, Trash2, Calendar, Filter, Loader2 } from 'lucide-react'
import { useMaintenance, useCreateMaintenance, useCompleteMaintenance, useDeleteMaintenance } from '../hooks/useMaintenance'
import StatusBadge from '../components/StatusBadge'
import ModuleTabBar from '../components/ModuleTabBar'
import { PageSkeleton } from '../components/LoadingSkeleton'
import { pageTransition } from '../animations/slideIn'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import { format } from 'date-fns'
import clsx from 'clsx'

const priorityConfig: Record<string, { bg: string; text: string }> = {
  LOW: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  MEDIUM: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400' },
}

export default function Maintenance() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: schedules = [], isLoading } = useMaintenance()
  const completeMutation = useCompleteMaintenance()
  const deleteMutation = useDeleteMaintenance()

  const filtered = schedules.filter((s) => statusFilter === 'all' || s.status === statusFilter.toUpperCase())

  if (isLoading) return <PageSkeleton />

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}><ModuleTabBar /></motion.div>

        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Maintenance Schedules</h2>
            <p className="text-sm text-gray-400">{schedules.length} total schedules • {schedules.filter((s) => s.status === 'OVERDUE').length} overdue</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />New Schedule
          </motion.button>
        </motion.div>

        <motion.div variants={staggerItem} className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {['all', 'pending', 'in_progress', 'completed', 'overdue'].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={clsx('px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                statusFilter === status ? 'bg-cold-500/20 border-cold-500/50 text-cold-400' : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-gray-200')}>
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-3">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
                <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">No maintenance schedules</p>
              </motion.div>
            ) : filtered.map((schedule, index) => {
              const priority = priorityConfig[schedule.priority] || priorityConfig.LOW
              return (
                <motion.div key={schedule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                  className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-gray-700/60 transition-colors">
                  <div className={clsx('p-2 rounded-lg', priority.bg)}>
                    <Wrench className={clsx('w-5 h-5', priority.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-200">{schedule.title}</h4>
                      <StatusBadge status={schedule.status} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{schedule.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>Device: {schedule.deviceName || schedule.deviceId}</span>
                      <span>•</span>
                      <span className="capitalize">{schedule.module?.replace('-', ' ') || 'N/A'}</span>
                      <span>•</span>
                      <span>Scheduled: {format(new Date(schedule.scheduledDate), 'MMM d, yyyy')}</span>
                      {schedule.assignedTo && <><span>•</span><span>Assigned: {schedule.assignedTo}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {schedule.status !== 'COMPLETED' && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => completeMutation.mutate(schedule.id)}
                        className="btn-success text-xs"><CheckCircle className="w-3.5 h-3.5" /> Complete</motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                      if (confirm('Delete this schedule?')) deleteMutation.mutate(schedule.id)
                    }} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /></motion.button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {showCreateModal && <CreateScheduleModal onClose={() => setShowCreateModal(false)} />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function CreateScheduleModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0])
  const [priority, setPriority] = useState('MEDIUM')
  const [module, setModule] = useState('cold-storage')
  const createMutation = useCreateMaintenance()

  const handleCreate = () => {
    createMutation.mutate({ title, description, deviceId, scheduledDate, priority, module } as any, { onSuccess: onClose })
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 z-50" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="glass-strong w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">New Maintenance Schedule</h3>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-400 mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Filter replacement..." className="input-field" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input-field" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Device ID</label>
              <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Scheduled Date</label>
              <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="input-field" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-400 mb-1">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="select-field">
                  <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
                </select></div>
              <div><label className="block text-sm text-gray-400 mb-1">Module</label>
                <select value={module} onChange={(e) => setModule(e.target.value)} className="select-field">
                  <option value="cold-storage">Cold Storage</option><option value="machine-health">Machine Health</option>
                  <option value="water-quality">Water Quality</option><option value="warehouse">Warehouse</option>
                </select></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={createMutation.isPending} className="btn-primary">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}Create
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
