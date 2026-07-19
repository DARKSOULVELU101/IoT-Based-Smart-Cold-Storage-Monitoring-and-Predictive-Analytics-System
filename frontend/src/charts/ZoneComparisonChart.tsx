import { motion } from 'framer-motion'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useZoneComparison } from '@/hooks/useZone'

export function ZoneComparisonChart() {
  const { data: comparison } = useZoneComparison()

  const chartData = comparison?.comparison_metrics || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-5"
    >
      <h3 className="mb-4 section-title">Zone Comparison</h3>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" fontSize={10} />
            <Radar name="DAIRY" dataKey="dairy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} animationDuration={1000} />
            <Radar name="MEDICINE" dataKey="medicine" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} strokeWidth={2} animationDuration={1000} />
            <Radar name="VEGETABLE" dataKey="vegetable" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} animationDuration={1000} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
