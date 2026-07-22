import clsx from 'clsx'

const variants = {
  online: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  offline: 'bg-gray-50 text-gray-500 border border-gray-200',
  maintenance: 'bg-amber-50 text-amber-700 border border-amber-200',
  low: 'bg-blue-50 text-blue-600 border border-blue-200',
  medium: 'bg-amber-50 text-amber-600 border border-amber-200',
  high: 'bg-orange-50 text-orange-600 border border-orange-200',
  critical: 'bg-red-50 text-red-600 border border-red-200',
  excellent: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  good: 'bg-blue-50 text-blue-600 border border-blue-200',
  warning: 'bg-amber-50 text-amber-600 border border-amber-200',
}

const dotVariants = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400',
  maintenance: 'bg-amber-500',
  low: 'bg-blue-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
  excellent: 'bg-emerald-500',
  good: 'bg-blue-500',
  warning: 'bg-amber-500',
}

export default function Badge({ variant = 'online', label, showDot = true, className }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {showDot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotVariants[variant])} />}
      {label}
    </span>
  )
}
