import clsx from 'clsx'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; pulse: boolean }> = {
  SAFE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', pulse: false },
  ONLINE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', pulse: false },
  WARNING: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', pulse: true },
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', pulse: true },
  OFFLINE: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400', pulse: false },
  LOW: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400', pulse: false },
  MEDIUM: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', pulse: true },
  HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400', pulse: true },
  GOOD: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', pulse: false },
  FAIR: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', pulse: false },
  POOR: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', pulse: true },
  PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', pulse: false },
  IN_PROGRESS: { bg: 'bg-cold-500/10', text: 'text-cold-400', dot: 'bg-cold-400', pulse: true },
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', pulse: false },
  OVERDUE: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', pulse: true },
  FAILED: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', pulse: true },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.OFFLINE

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        config.bg, config.text,
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        size === 'lg' && 'px-3 py-1.5 text-sm',
      )}
    >
      <span className={clsx(
        'rounded-full', config.dot,
        size === 'sm' && 'h-1.5 w-1.5',
        size === 'md' && 'h-2 w-2',
        size === 'lg' && 'h-2.5 w-2.5',
        config.pulse && 'animate-pulse'
      )} />
      {status}
    </span>
  )
}
