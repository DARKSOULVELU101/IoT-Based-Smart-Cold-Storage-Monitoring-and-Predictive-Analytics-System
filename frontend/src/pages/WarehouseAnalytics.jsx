import { motion } from 'framer-motion'
import { useState } from 'react'
import { Warehouse, Thermometer, Droplets, AlertTriangle } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import StatCard from '../components/ui/StatCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useWarehouseAnalytics } from '../lib/hooks'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function WarehouseAnalytics() {
  const [hours, setHours] = useState(24)
  const { data, isLoading } = useWarehouseAnalytics({ hours })

  if (isLoading) return <LoadingSpinner />

  const chartData = (data?.labels || []).map((label, i) => ({
    name: label.split(' ')[1] || label,
    temperature: data?.temperature?.[i],
    humidity: data?.humidity?.[i],
    risk: data?.risk_score?.[i],
  }))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Analytics</h1>
          <p className="text-sm text-gray-500">Environment conditions and risk assessment</p>
        </div>
        <select
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value={6}>Last 6 hours</option>
          <option value={24}>Last 24 hours</option>
          <option value={72}>Last 72 hours</option>
          <option value={168}>Last week</option>
        </select>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard icon={Thermometer} label="Avg Temperature" value={data?.summary?.avg_temp || 0} suffix="°C" color="accent" />
        <StatCard icon={Droplets} label="Avg Humidity" value={data?.summary?.avg_humidity || 0} suffix="%" color="secondary" />
        <StatCard icon={AlertTriangle} label="Avg Risk Score" value={data?.summary?.avg_risk || 0} color="red" />
        <StatCard icon={Warehouse} label="Readings" value={data?.summary?.total_readings || 0} color="primary" />
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-4">Temperature & Humidity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="whTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="whHumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="temperature" stroke="#4F46E5" fill="url(#whTempGrad)" strokeWidth={2} name="Temp (°C)" />
                <Area type="monotone" dataKey="humidity" stroke="#06B6D4" fill="url(#whHumGrad)" strokeWidth={2} name="Humidity (%)" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-4">Risk Score Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="risk" stroke="#EF4444" strokeWidth={2} dot={false} name="Risk Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
