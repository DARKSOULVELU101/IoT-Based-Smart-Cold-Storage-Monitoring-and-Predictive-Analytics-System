import { motion } from 'framer-motion'
import { useState } from 'react'
import { TrendingUp, Brain, Zap } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { usePredictiveAnalytics } from '../lib/hooks'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function PredictiveAnalytics() {
  const [hours, setHours] = useState(72)
  const [forecast, setForecast] = useState(24)
  const { data, isLoading } = usePredictiveAnalytics({ hours, forecast_hours: forecast })

    if (isLoading) return <LoadingSpinner />

  const allLabels = [...(data?.historical_labels || []), ...(data?.forecast_labels || [])]
  const histTemps = data?.historical_temps || []
  const forecastTemps = data?.forecast_temps || []
  const histHumid = data?.historical_humidity || []
  const forecastHumid = data?.forecast_humidity || []

  const tempData = allLabels.map((label, i) => ({
    name: label.split(' ')[1] || label,
    actual: i < histTemps.length ? histTemps[i] : null,
    predicted: i >= histTemps.length ? forecastTemps[i - histTemps.length] : null,
  }))

  const humidData = allLabels.map((label, i) => ({
    name: label.split(' ')[1] || label,
    actual: i < histHumid.length ? histHumid[i] : null,
    predicted: i >= histHumid.length ? forecastHumid[i - histHumid.length] : null,
  }))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-sm text-gray-500">AI-powered forecasting and trend analysis</p>
        </div>
        <div className="flex gap-3">
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value={24}>24h History</option>
            <option value={72}>72h History</option>
            <option value={168}>1 week History</option>
          </select>
          <select
            value={forecast}
            onChange={(e) => setForecast(Number(e.target.value))}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value={6}>6h Forecast</option>
            <option value={12}>12h Forecast</option>
            <option value={24}>24h Forecast</option>
          </select>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Model Confidence</div>
              <div className="text-lg font-bold text-gray-900">{((data?.confidence || 0) * 100).toFixed(0)}%</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-secondary-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Forecast Horizon</div>
              <div className="text-lg font-bold text-gray-900">{forecast} hours</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Algorithm</div>
              <div className="text-lg font-bold text-gray-900">Linear Regression</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-1">Temperature Forecast</h3>
          <p className="text-xs text-gray-400 mb-4">Historical data with linear trend prediction</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval={Math.floor(tempData.length / 10)} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="actual" stroke="#4F46E5" strokeWidth={2} dot={false} name="Actual" connectNulls={false} />
                <Line type="monotone" dataKey="predicted" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted" connectNulls={false} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-1">Humidity Forecast</h3>
          <p className="text-xs text-gray-400 mb-4">Predicted humidity levels</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={humidData}>
                <defs>
                  <linearGradient id="humPredGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval={Math.floor(humidData.length / 10)} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="actual" stroke="#06B6D4" strokeWidth={2} dot={false} name="Actual" connectNulls={false} />
                <Line type="monotone" dataKey="predicted" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted" connectNulls={false} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
