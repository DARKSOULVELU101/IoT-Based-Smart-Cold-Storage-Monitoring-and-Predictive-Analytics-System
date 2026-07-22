import { motion } from 'framer-motion'
import clsx from 'clsx'
import AnimatedNumber from './AnimatedNumber'

const colorMap = {
  primary: 'from-primary-500 to-primary-600',
  secondary: 'from-secondary-500 to-secondary-600',
  accent: 'from-accent-500 to-accent-600',
  green: 'from-emerald-500 to-emerald-600',
  red: 'from-red-500 to-red-600',
  amber: 'from-amber-500 to-amber-600',
}

const iconBgMap = {
  primary: 'bg-primary-50',
  secondary: 'bg-secondary-50',
  accent: 'bg-accent-50',
  green: 'bg-emerald-50',
  red: 'bg-red-50',
  amber: 'bg-amber-50',
}

const iconColorMap = {
  primary: 'text-primary-500',
  secondary: 'text-secondary-500',
  accent: 'text-accent-500',
  green: 'text-emerald-500',
  red: 'text-red-500',
  amber: 'text-amber-500',
}

export default function StatCard({ icon: Icon, label, value, trend, trendValue, color = 'primary', animated = true }) {
  return (
    <motion.div
      className="glass-card rounded-2xl p-6 relative overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <div className={clsx('absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -mr-10 -mt-10 bg-gradient-to-br', colorMap[color])} />
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', iconBgMap[color])}>
          <Icon className={clsx('w-6 h-6', iconColorMap[color])} />
        </div>
        {trendValue && (
          <span className={clsx('text-xs font-medium px-2 py-1 rounded-full',
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          )}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">
        {animated ? <AnimatedNumber value={value} decimals={typeof value === 'number' ? (value % 1 !== 0 ? 1 : 0) : 0} /> : value}
      </div>
    </motion.div>
  )
}
