import { motion } from 'framer-motion'
import clsx from 'clsx'

interface RealTimeIndicatorProps {
  active?: boolean
  label?: string
  className?: string
}

export default function RealTimeIndicator({ active = true, label = 'Live', className }: RealTimeIndicatorProps) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="relative flex items-center justify-center">
        {active && (
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-emerald-400"
            animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <div className={clsx(
          'w-2 h-2 rounded-full z-10',
          active ? 'bg-emerald-400' : 'bg-gray-500'
        )} />
      </div>
      <span className={clsx(
        'text-xs font-medium',
        active ? 'text-emerald-400' : 'text-gray-500'
      )}>
        {label}
      </span>
    </div>
  )
}
