import { cn, getZoneColor } from '@/lib/utils'

interface ZoneBadgeProps {
  zone: string
  className?: string
}

export function ZoneBadge({ zone, className }: ZoneBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        getZoneColor(zone),
        className
      )}
    >
      {zone}
    </span>
  )
}
