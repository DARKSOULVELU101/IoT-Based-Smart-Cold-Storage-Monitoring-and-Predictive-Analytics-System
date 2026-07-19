import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'disabled'
  className?: string
  showLabel?: boolean
}

export function StatusIndicator({ status, className, showLabel }: StatusIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            status === 'online' && 'bg-emerald-400',
            status === 'offline' && 'bg-red-400',
            status === 'disabled' && 'bg-slate-400'
          )}
        />
        {status === 'online' && (
          <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
      </div>
      {showLabel && (
        <span
          className={cn(
            'text-xs font-medium capitalize',
            status === 'online' && 'text-emerald-400',
            status === 'offline' && 'text-red-400',
            status === 'disabled' && 'text-slate-400'
          )}
        >
          {status}
        </span>
      )}
    </div>
  )
}
