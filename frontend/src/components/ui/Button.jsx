import clsx from 'clsx'
import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25',
  secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-lg shadow-secondary-500/25',
  outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ variant = 'primary', size = 'md', children, className, ...props }) {
  return (
    <motion.button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
