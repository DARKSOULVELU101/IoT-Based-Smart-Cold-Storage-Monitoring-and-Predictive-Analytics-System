import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function GlassCard({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      className={clsx('glass-card rounded-2xl p-6', hover && 'glass-card-hover cursor-pointer', className)}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
