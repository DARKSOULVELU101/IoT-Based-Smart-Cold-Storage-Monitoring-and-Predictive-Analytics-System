import { motion } from 'framer-motion'
import { useState } from 'react'
import { Droplets, Beaker, Waves, Sparkles } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import StatCard from '../components/ui/StatCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useWaterQualityAnalytics } from '../lib/hooks'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function WaterQualityAnalytics() {
  const [hours, setHours] = useState(24)
  const { data, isLoading } = useWaterQualityAnalytics({ hours })

  if (isLoading) return <LoadingSpinner />

  const chartData = (data?.labels || []).map((label, i) => ({
    name: label.split(' ')[1] || label,
    ph: data?.ph?.[i],
    turbidity: data?.turbidity?.[i],
    tds: data?.tds?.[i],
    score: data?.scores?.[i],
  }))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Water Quality Analytics</h1>
          <p className="text-sm text-gray-500">pH, turbidity, TDS and quality scoring</p>
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

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Beaker} label="Avg pH" value={data?.summary?.avg_ph || 0} color="secondary" />
        <StatCard icon={Sparkles} label="Avg Quality Score" value={data?.summary?.avg_score || 0} suffix="%" color="green" />
        <StatCard icon={Waves} label="Total Readings" value={data?.summary?.total_readings || 0} color="primary" />
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-4">pH Levels Over Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 14]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="ph" stroke="#06B6D4" strokeWidth={2} dot={false} name="pH" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <GlassCard hover={false}>
            <h3 className="font-semibold text-gray-900 mb-4">Turbidity & TDS</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="turbidity" stroke="#F59E0B" strokeWidth={2} dot={false} name="Turbidity" />
                  <Line type="monotone" dataKey="tds" stroke="#8B5CF6" strokeWidth={2} dot={false} name="TDS" />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard hover={false}>
            <h3 className="font-semibold text-gray-900 mb-4">Quality Score Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="score" stroke="#10B981" fill="url(#wqGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  )
}
