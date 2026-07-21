import { motion } from 'framer-motion'
import { format } from 'date-fns'
import clsx from 'clsx'

interface TimelineEvent {
  id: string
  title: string
  description?: string
  timestamp: string
  type: 'info' | 'warning' | 'error' | 'success'
}

interface StatusTimelineProps {
  events: TimelineEvent[]
  className?: string
}

const typeConfig = {
  info: { dot: 'bg-cold-400', line: 'border-cold-500/30' },
  warning: { dot: 'bg-amber-400', line: 'border-amber-500/30' },
  error: { dot: 'bg-red-400', line: 'border-red-500/30' },
  success: { dot: 'bg-emerald-400', line: 'border-emerald-500/30' },
}

export default function StatusTimeline({ events, className }: StatusTimelineProps) {
  return (
    <div className={clsx('space-y-0', className)}>
      {events.map((event, index) => {
        const config = typeConfig[event.type]
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4 pb-4"
          >
            {index < events.length - 1 && (
              <div className={clsx('absolute left-[7px] top-4 w-px h-[calc(100%-8px)] border-l', config.line)} />
            )}
            <div className={clsx('w-4 h-4 rounded-full flex-shrink-0 mt-0.5 z-10 border-2 border-gray-900', config.dot)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-200">{event.title}</p>
                <span className="text-[10px] text-gray-500">{format(new Date(event.timestamp), 'HH:mm')}</span>
              </div>
              {event.description && (
                <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
