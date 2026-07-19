import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingSkeleton } from './LoadingSkeleton'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color: string
  loading?: boolean
  suffix?: string
}

export function StatCard({ title, value, change, icon: Icon, color, loading, suffix }: StatCardProps) {
  if (loading) {
    return <LoadingSkeleton className="h-[140px]" />
  }

  const trend = change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'flat') : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3 }}
      className="glass-card-hover group relative overflow-hidden p-5"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className={cn('absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-20', color)} />
      </div>

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-400" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
              {trend === 'flat' && <Minus className="h-3 w-3 text-muted-foreground" />}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' && 'text-emerald-400',
                  trend === 'down' && 'text-red-400',
                  trend === 'flat' && 'text-muted-foreground'
                )}
              >
                {change !== undefined ? `${Math.abs(change).toFixed(1)}%` : ''}
              </span>
            </div>
          )}
        </div>

        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color, 'bg-opacity-10')}>
          <Icon className={cn('h-5 w-5', color.replace('bg-', 'text-'))} />
        </div>
      </div>
    </motion.div>
  )
}
