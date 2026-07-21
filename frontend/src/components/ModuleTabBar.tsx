import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Thermometer, Cpu, Droplet, Warehouse, LayoutGrid } from 'lucide-react'
import clsx from 'clsx'

const modules = [
  { path: '/cold-storage', label: 'Cold Storage', icon: Thermometer, activeColor: 'bg-cold-500/15 border-cold-500/30 text-cold-400', dotColor: 'bg-cold-400' },
  { path: '/machine-health', label: 'Machine Health', icon: Cpu, activeColor: 'bg-machine-500/15 border-machine-500/30 text-machine-400', dotColor: 'bg-machine-400' },
  { path: '/water-quality', label: 'Water Quality', icon: Droplet, activeColor: 'bg-water-500/15 border-water-500/30 text-water-400', dotColor: 'bg-water-400' },
  { path: '/warehouse', label: 'Warehouse', icon: Warehouse, activeColor: 'bg-warehouse-500/15 border-warehouse-500/30 text-warehouse-400', dotColor: 'bg-warehouse-400' },
]

export default function ModuleTabBar() {
  const location = useLocation()

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <NavLink
        to="/"
        className={({ isActive }) => clsx(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 whitespace-nowrap',
          isActive
            ? 'bg-gray-500/15 border-gray-500/30 text-gray-200'
            : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        All Modules
      </NavLink>
      {modules.map((mod) => {
        const isActive = location.pathname.startsWith(mod.path)
        const Icon = mod.icon
        return (
          <NavLink
            key={mod.path}
            to={mod.path}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 whitespace-nowrap',
              isActive
                ? mod.activeColor
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            )}
          >
            <Icon className="w-4 h-4" />
            {mod.label}
            {isActive && (
              <motion.div
                layoutId="module-tab"
                className={clsx('w-1.5 h-1.5 rounded-full', mod.dotColor)}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </NavLink>
        )
      })}
    </div>
  )
}
