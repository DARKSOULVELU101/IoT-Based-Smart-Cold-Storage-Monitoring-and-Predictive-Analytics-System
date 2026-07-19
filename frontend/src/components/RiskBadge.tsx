import { cn, getRiskColor, getRiskBgColor, getRiskLabel } from '@/lib/utils'

interface RiskBadgeProps {
  score: number
  className?: string
}

export function RiskBadge({ score, className }: RiskBadgeProps) {
  const label = getRiskLabel(score)
  const isCritical = label === 'CRITICAL'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        getRiskBgColor(score),
        getRiskColor(score),
        isCritical && 'animate-pulse',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          score <= 25 && 'bg-emerald-400',
          score > 25 && score <= 50 && 'bg-yellow-400',
          score > 50 && score <= 75 && 'bg-orange-400',
          score > 75 && 'bg-red-400'
        )}
      />
      {label}
    </span>
  )
}
