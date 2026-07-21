import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Clock, CheckCircle, AlertCircle, Loader2, Calendar } from 'lucide-react'
import { useReports, useGenerateReport, useDownloadReport } from '../hooks/useReports'
import { useDevices } from '../hooks/useDevices'
import ModuleTabBar from '../components/ModuleTabBar'
import { PageSkeleton } from '../components/LoadingSkeleton'
import { pageTransition } from '../animations/slideIn'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import { format } from 'date-fns'
import clsx from 'clsx'

const reportTypes = [
  { value: 'daily', label: 'Daily Summary' },
  { value: 'weekly', label: 'Weekly Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'custom', label: 'Custom Range' },
  { value: 'alerts', label: 'Alert History' },
  { value: 'energy', label: 'Energy Analysis' },
]

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  GENERATING: { icon: Loader2, color: 'text-cold-400', bg: 'bg-cold-500/10' },
  COMPLETED: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  FAILED: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
}

export default function Reports() {
  const { data: reports = [], isLoading: reportsLoading } = useReports()
  const { data: devices = [] } = useDevices()
  const generateMutation = useGenerateReport()
  const downloadMutation = useDownloadReport()
  const [reportType, setReportType] = useState('daily')
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [deviceFilter, setDeviceFilter] = useState('')
  const [reportTitle, setReportTitle] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')

  const handleGenerate = () => {
    generateMutation.mutate({
      type: reportType, date_from: dateFrom, date_to: dateTo,
      device_id: deviceFilter || undefined, title: reportTitle || undefined,
      module: moduleFilter as any || undefined,
    })
  }

  if (reportsLoading) return <PageSkeleton />

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}><ModuleTabBar /></motion.div>
        <motion.div variants={staggerItem}>
          <h2 className="text-xl font-bold text-gray-100">Reports</h2>
          <p className="text-sm text-gray-400">Generate and download system reports</p>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-cold-400" /><h3 className="text-sm font-semibold text-gray-300">Generate New Report</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="select-field">
                {reportTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select></div>
            <div><label className="block text-sm text-gray-400 mb-1">Module</label>
              <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="select-field">
                <option value="">All Modules</option><option value="cold-storage">Cold Storage</option>
                <option value="machine-health">Machine Health</option><option value="water-quality">Water Quality</option>
                <option value="warehouse">Warehouse</option>
              </select></div>
            <div><label className="block text-sm text-gray-400 mb-1">Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Date To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Device Filter (Optional)</label>
              <select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)} className="select-field">
                <option value="">All Devices</option>
                {devices.map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}
              </select></div>
            <div><label className="block text-sm text-gray-400 mb-1">Report Title (Optional)</label>
              <input type="text" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Custom title..." className="input-field" /></div>
            <div className="flex items-end">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerate} disabled={generateMutation.isPending} className="btn-primary w-full justify-center">
                {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}Generate Report
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem}>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Reports</h3>
          {reports.length === 0 ? (
            <div className="glass-card p-12 text-center"><FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">No reports generated yet</p></div>
          ) : (
            <div className="space-y-2">
              {reports.map((report, index) => {
                const status = statusConfig[report.status] || statusConfig.PENDING
                const StatusIcon = status.icon
                return (
                  <motion.div key={report.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                    className="glass-card p-4 flex items-center gap-4 hover:border-gray-700/60 transition-colors">
                    <div className={clsx('p-2 rounded-lg', status.bg)}>
                      <StatusIcon className={clsx('w-5 h-5', status.color, report.status === 'GENERATING' && 'animate-spin')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-200 truncate">{report.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="capitalize">{report.type}</span><span>•</span>
                        <span>{format(new Date(report.dateFrom), 'MMM d')} - {format(new Date(report.dateTo), 'MMM d, yyyy')}</span>
                        {report.module && <><span>•</span><span className="capitalize">{report.module.replace('-', ' ')}</span></>}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                      <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', status.bg, status.color)}>{report.status}</span>
                      {report.fileSize && <span className="text-xs text-gray-500">{(report.fileSize / 1024).toFixed(1)} KB</span>}
                      {report.status === 'COMPLETED' && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => downloadMutation.mutate(report.id)}
                          className="p-2 rounded-lg bg-cold-500/10 text-cold-400 hover:bg-cold-500/20 transition-colors"><Download className="w-4 h-4" /></motion.button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
