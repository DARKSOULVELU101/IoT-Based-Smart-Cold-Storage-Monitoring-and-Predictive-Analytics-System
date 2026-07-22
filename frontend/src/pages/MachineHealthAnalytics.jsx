import { motion } from 'framer-motion'
import { useState } from 'react'
import { Activity, Heart, Shield, AlertTriangle } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useMachineHealthAnalytics } from '../lib/hooks'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function MachineHealthAnalytics() {
  const [hours, setHours] = useState(24)
  const { data, isLoading } = useMachineHealthAnalytics({ hours })

  if (isLoading) return <LoadingSpinner />

  const chartData = (data?.labels || []).map((label, i) => ({
    name: label.split(' ')[1] || label,
    score: data?.values?.[i],
  }))

  const statusMap = { excellent: 'excellent', good: 'good', warning: 'warning', critical: 'critical' }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Machine Health Analytics</h1>
          <p className="text-sm text-gray-500">Equipment vibration and health monitoring</p>
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
        <StatCard icon={Activity} label="Avg Health Score" value={data?.summary?.avg_score || 0} suffix="%" color="green" />
        <StatCard icon={Heart} label="Best Score" value={data?.summary?.max || 0} suffix="%" color="secondary" />
        <StatCard icon={AlertTriangle} label="Lowest Score" value={data?.summary?.min || 0} suffix="%" color="red" />
        <StatCard icon={Shield} label="Status" value={0} color="primary" animated={false} />
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Health Score Over Time</h3>
            <Badge variant={statusMap[data?.summary?.status] || 'good'} label={data?.summary?.status || 'N/A'} />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <ReferenceLine y={60} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Warning', fill: '#EF4444', fontSize: 11 }} />
                <ReferenceLine y={80} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Good', fill: '#10B981', fontSize: 11 }} />
                <Area type="monotone" dataKey="score" stroke="#10B981" fill="url(#healthGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
