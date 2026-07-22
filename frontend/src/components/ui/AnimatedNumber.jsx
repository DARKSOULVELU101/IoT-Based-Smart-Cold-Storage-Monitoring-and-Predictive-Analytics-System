import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function AnimatedNumber({ value, duration = 2, decimals = 0, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, (latest) => {
    return `${prefix}${Number(latest).toFixed(decimals)}${suffix}`
  })

  useEffect(() => {
    const controls = animate(motionVal, value || 0, {
      duration,
      ease: [0.4, 0, 0.2, 1],
    })
    return controls.stop
  }, [value, duration, motionVal])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (ref.current) ref.current.textContent = latest
    })
    return unsubscribe
  }, [rounded])

  return <span ref={ref}>{`${prefix}0${suffix}`}</span>
}
