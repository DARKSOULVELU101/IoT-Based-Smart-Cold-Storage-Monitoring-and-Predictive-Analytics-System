import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  decimals?: number
}

export default function AnimatedCounter({ value, duration = 1.5, className, decimals = 0 }: AnimatedCounterProps) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (current) => current.toFixed(decimals))
  const [displayValue, setDisplayValue] = useState('0')
  const prevValue = useRef(0)

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => setDisplayValue(latest))
    return unsubscribe
  }, [display])

  useEffect(() => {
    const start = prevValue.current
    const end = value
    const durationMs = duration * 1000
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * eased
      setDisplayValue(current.toFixed(decimals))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
    prevValue.current = value
  }, [value, duration, decimals])

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue}
    </motion.span>
  )
}
