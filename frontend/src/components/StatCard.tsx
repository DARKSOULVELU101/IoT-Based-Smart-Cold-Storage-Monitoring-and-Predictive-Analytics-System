import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import clsx from 'clsx'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number | ReactNode
  trend?: { value: number; isPositive: boolean }
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan' | 'orange'
  className?: string
}

const colorMap = {
  blue: { iconBg: 'bg-cold-500/10', iconText: 'text-cold-400', glow: 'glow-blue' },
  green: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', glow: 'glow-green' },
  amber: { iconBg: 'bg-amber-500/10', iconText: 'text-amber-400', glow: 'glow-amber' },
  red: { iconBg: 'bg-red-500/10', iconText: 'text-red-400', glow: 'glow-red' },
  purple: { iconBg: 'bg-purple-500/10', iconText: 'text-purple-400', glow: 'glow-blue' },
  cyan: { iconBg: 'bg-water-500/10', iconText: 'text-water-400', glow: 'glow-blue' },
  orange: { iconBg: 'bg-warehouse-500/10', iconText: 'text-warehouse-400', glow: 'glow-amber' },
}

export default function StatCard({ icon, label, value, trend, color = 'blue', className }: StatCardProps) {
  const colors = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={clsx('stat-card', colors.glow, className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-gray-100"
          >
            {value}
          </motion.p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={clsx('text-xs font-medium', trend.isPositive ? 'text-emerald-400' : 'text-red-400')}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs last hour</span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl', colors.iconBg)}>
          <div className={clsx('w-6 h-6', colors.iconText)}>{icon}</div>
        </div>
      </div>
    </motion.div>
  )
}
