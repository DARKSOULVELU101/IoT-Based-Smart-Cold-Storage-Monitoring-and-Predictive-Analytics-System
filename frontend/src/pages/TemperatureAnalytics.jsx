import { motion } from 'framer-motion'
import { useState } from 'react'
import { Thermometer } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import StatCard from '../components/ui/StatCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTemperatureAnalytics } from '../lib/hooks'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function TemperatureAnalytics() {
  const [hours, setHours] = useState(24)
  const { data, isLoading } = useTemperatureAnalytics({ hours })

  if (isLoading) return <LoadingSpinner />

  const chartData = (data?.labels || []).map((label, i) => ({
    name: label.split(' ')[1] || label,
    temperature: data?.values?.[i],
  }))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Temperature Analytics</h1>
          <p className="text-sm text-gray-500">Monitor temperature trends across all devices</p>
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
        <StatCard icon={Thermometer} label="Average" value={data?.summary?.avg || 0} suffix="°C" color="accent" />
        <StatCard icon={Thermometer} label="Minimum" value={data?.summary?.min || 0} suffix="°C" color="secondary" />
        <StatCard icon={Thermometer} label="Maximum" value={data?.summary?.max || 0} suffix="°C" color="red" />
        <StatCard icon={Thermometer} label="Std Deviation" value={data?.summary?.std_dev || 0} suffix="°C" color="primary" />
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-4">Temperature Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="temperature" stroke="#4F46E5" fill="url(#tempAreaGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-4">Temperature Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="temperature" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
