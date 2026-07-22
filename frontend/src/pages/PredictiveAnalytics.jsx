import { motion } from 'framer-motion'
import { useState } from 'react'
import { TrendingUp, Brain, Zap, AlertTriangle, Shield, Clock, Cpu, Activity } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { usePredictiveAnalytics, useFailurePrediction, useAnomalyDetection } from '../lib/hooks'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const riskColors = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#10B981' }
const severityIcons = { critical: AlertTriangle, high: Shield, medium: Clock, low: Activity }

function FailureCard({ prediction }) {
  const color = riskColors[prediction.risk_level] || '#6B7280'
  const Icon = severityIcons[prediction.risk_level] || Activity
  return (
    <GlassCard>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{prediction.device_name}</h4>
            <p className="text-[11px] text-gray-400">Device #{prediction.device_id}</p>
          </div>
        </div>
        <Badge variant={prediction.risk_level} label={prediction.risk_level} />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">Failure Probability</span>
          <span className="font-medium" style={{ color }}>{(prediction.failure_probability * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${prediction.failure_probability * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {prediction.predicted_failure_hours != null && (
        <div className="text-xs text-gray-500 mb-2">
          <Clock className="w-3.5 h-3.5 inline mr-1" />
          Estimated {prediction.predicted_failure_hours.toFixed(0)} hours until failure
        </div>
      )}

      {prediction.contributing_factors?.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Contributing Factors</div>
          <div className="flex flex-wrap gap-1">
            {prediction.contributing_factors.map((f, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
        <Shield className="w-3.5 h-3.5 inline mr-1" />
        {prediction.recommendation}
      </div>
    </GlassCard>
  )
}

function AnomalyCard({ anomaly }) {
  const severityColors = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B' }
  const color = severityColors[anomaly.severity] || '#6B7280'
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-gray-900">{anomaly.device_name}</span>
          <Badge variant={anomaly.severity} label={anomaly.severity} />
        </div>
        <p className="text-xs text-gray-500 mb-1">{anomaly.anomaly_type}</p>
        <p className="text-xs text-gray-400">{anomaly.description}</p>
        {anomaly.expected_range && (
          <div className="text-[10px] text-gray-400 mt-1">
            Expected: {anomaly.expected_range.min} - {anomaly.expected_range.max} | Detected at: {anomaly.detected_at}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PredictiveAnalytics() {
  const [hours, setHours] = useState(72)
  const [forecast, setForecast] = useState(24)
  const { data, isLoading } = usePredictiveAnalytics({ hours, forecast_hours: forecast })
  const { data: failureData, isLoading: failureLoading } = useFailurePrediction()
  const { data: anomalyData, isLoading: anomalyLoading } = useAnomalyDetection()

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

  const predictions = failureData?.predictions || []
  const anomalies = anomalyData?.anomalies || []
  const criticalCount = predictions.filter(p => p.risk_level === 'critical').length
  const highCount = predictions.filter(p => p.risk_level === 'high').length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-sm text-gray-500">AI-powered forecasting, failure prediction, and anomaly detection</p>
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

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Failure Prediction</h2>
            <p className="text-xs text-gray-400">Predictive maintenance analysis for all devices</p>
          </div>
          {predictions.length > 0 && (
            <div className="flex gap-2">
              {criticalCount > 0 && <Badge variant="critical" label={`${criticalCount} Critical`} />}
              {highCount > 0 && <Badge variant="high" label={`${highCount} High`} />}
            </div>
          )}
        </div>
      </motion.div>

      {failureLoading ? (
        <div className="text-center py-8"><LoadingSpinner /></div>
      ) : predictions.length === 0 ? (
        <motion.div variants={item}>
          <GlassCard hover={false}>
            <div className="text-center py-8">
              <Shield className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No failure predictions available</p>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map(p => <FailureCard key={p.device_id} prediction={p} />)}
        </motion.div>
      )}

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Anomaly Detection</h2>
            <p className="text-xs text-gray-400">Statistical anomalies detected in real-time sensor data</p>
          </div>
          {anomalies.length > 0 && (
            <Badge variant="warning" label={`${anomalies.length} Anomalies`} />
          )}
        </div>
      </motion.div>

      {anomalyLoading ? (
        <div className="text-center py-8"><LoadingSpinner /></div>
      ) : anomalies.length === 0 ? (
        <motion.div variants={item}>
          <GlassCard hover={false}>
            <div className="text-center py-8">
              <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No anomalies detected</p>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <GlassCard hover={false}>
            <div className="space-y-3">
              {anomalies.map((a, i) => <AnomalyCard key={i} anomaly={a} />)}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  )
}
