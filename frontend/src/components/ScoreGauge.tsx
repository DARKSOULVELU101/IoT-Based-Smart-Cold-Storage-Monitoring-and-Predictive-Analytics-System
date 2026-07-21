import { motion } from 'framer-motion'
import clsx from 'clsx'

interface ScoreGaugeProps {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

const sizeConfig = {
  sm: { width: 80, height: 80, radius: 34, stroke: 6, fontSize: 'text-lg', labelSize: 'text-[9px]' },
  md: { width: 120, height: 120, radius: 50, stroke: 8, fontSize: 'text-2xl', labelSize: 'text-[10px]' },
  lg: { width: 160, height: 160, radius: 68, stroke: 10, fontSize: 'text-3xl', labelSize: 'text-xs' },
}

function getScoreColor(score: number, customColor?: string): string {
  if (customColor) return customColor
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

export default function ScoreGauge({ score, label = 'Score', size = 'md', color, className }: ScoreGaugeProps) {
  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * config.radius
  const progress = (Math.min(score, 100) / 100) * circumference
  const strokeColor = getScoreColor(score, color)

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="-rotate-90"
        >
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth={config.stroke}
          />
          <motion.circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className={clsx('font-bold text-gray-100', config.fontSize)}
          >
            {Math.round(score)}
          </motion.span>
        </div>
      </div>
      <span className={clsx('font-medium text-gray-400 mt-2', config.labelSize)}>{label}</span>
    </div>
  )
}
