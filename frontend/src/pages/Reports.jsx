import { motion } from 'framer-motion'
import { useState } from 'react'
import { FileText, Download, Calendar, BarChart3, FileSpreadsheet } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useDailyReport, useWeeklyReport, useMonthlyReport } from '../lib/hooks'
import { reportAPI } from '../lib/api'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function Reports() {
  const [activeTab, setActiveTab] = useState('daily')
  const { data: daily, isLoading: loadingDaily } = useDailyReport({})
  const { data: weekly, isLoading: loadingWeekly } = useWeeklyReport({})
  const { data: monthly, isLoading: loadingMonthly } = useMonthlyReport({})

  const handleExportExcel = async () => {
    try {
      const response = await reportAPI.exportExcel({ hours: 24 })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'iot_report.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await reportAPI.exportCSV({ hours: 24 })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'iot_report.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const tabs = [
    { key: 'daily', label: 'Daily Report' },
    { key: 'weekly', label: 'Weekly Report' },
    { key: 'monthly', label: 'Monthly Report' },
  ]

  const currentReport = activeTab === 'daily' ? daily : activeTab === 'weekly' ? weekly : monthly
  const isLoading = activeTab === 'daily' ? loadingDaily : activeTab === 'weekly' ? loadingWeekly : loadingMonthly

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Generate and export IoT monitoring reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex gap-2 border-b border-gray-100 pb-0">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {isLoading ? <LoadingSpinner /> : currentReport && (
        <motion.div variants={item}>
          <GlassCard hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">{currentReport.report_type} Report</h3>
                <p className="text-xs text-gray-400">
                  {currentReport.start_date && `${new Date(currentReport.start_date).toLocaleDateString()} - `}
                  {currentReport.end_date && new Date(currentReport.end_date).toLocaleDateString()}
                  {currentReport.date && new Date(currentReport.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Total Readings</div>
                <div className="text-xl font-bold text-gray-900">{currentReport.total_readings}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Avg Temperature</div>
                <div className="text-xl font-bold text-gray-900">
                  {currentReport.temperature_avg != null ? `${currentReport.temperature_avg}°C` : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Temperature Range</div>
                <div className="text-xl font-bold text-gray-900">
                  {currentReport.temperature_min != null ? `${currentReport.temperature_min}°C - ${currentReport.temperature_max}°C` : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Total Alerts</div>
                <div className="text-xl font-bold text-gray-900">{currentReport.alerts_count || 0}</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  )
}
