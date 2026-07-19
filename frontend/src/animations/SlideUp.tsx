import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SlideUpProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  distance?: number
}

export function SlideUp({ children, delay = 0, duration = 0.6, className, distance = 40 }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
