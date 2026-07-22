import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 40 }) {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
