import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Download,
  Plus,
  Calendar,
  X,
  Loader2,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useDevices } from '@/hooks/useDevices'
import { reportAPI } from '@/services/api'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function Reports() {
  const queryClient = useQueryClient()
  const { data: devices } = useDevices()
  const [showGenerate, setShowGenerate] = useState(false)
  const [reportConfig, setReportConfig] = useState({
    type: 'summary',
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    device_id: undefined as number | undefined,
  })

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data } = await reportAPI.getAll()
      return data
    },
  })

  const generateReport = useMutation({
    mutationFn: (config: typeof reportConfig) => reportAPI.generate(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setShowGenerate(false)
    },
  })

  const handleDownload = async (id: number) => {
    try {
      const response = await reportAPI.download(id)
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${id}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      // ignore
    }
  }

  const handleGenerate = () => {
    generateReport.mutate(reportConfig)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generate and download monitoring reports
          </p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Generate Report
        </button>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-[80px]" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reports?.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">{report.type} Report</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(report.generated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    report.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : report.status === 'generating'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-red-500/10 text-red-400'
                  )}
                >
                  {report.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                  {report.status}
                </span>
                {report.status === 'completed' && (
                  <button
                    onClick={() => handleDownload(report.id)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {(!reports || reports.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No reports generated yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Click "Generate Report" to create your first report</p>
            </motion.div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showGenerate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGenerate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Generate Report</h2>
                <button onClick={() => setShowGenerate(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Report Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['summary', 'detailed', 'compliance', 'energy'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setReportConfig({ ...reportConfig, type })}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all',
                          reportConfig.type === type
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-white/[0.08] text-muted-foreground hover:border-white/[0.15]'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={reportConfig.start_date}
                      onChange={(e) => setReportConfig({ ...reportConfig, start_date: e.target.value })}
                      className="glass-input flex-1 text-sm"
                    />
                    <input
                      type="date"
                      value={reportConfig.end_date}
                      onChange={(e) => setReportConfig({ ...reportConfig, end_date: e.target.value })}
                      className="glass-input flex-1 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Device (Optional)</label>
                  <select
                    value={reportConfig.device_id || ''}
                    onChange={(e) =>
                      setReportConfig({
                        ...reportConfig,
                        device_id: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="glass-input w-full text-sm"
                  >
                    <option value="">All Devices</option>
                    {devices?.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generateReport.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {generateReport.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
