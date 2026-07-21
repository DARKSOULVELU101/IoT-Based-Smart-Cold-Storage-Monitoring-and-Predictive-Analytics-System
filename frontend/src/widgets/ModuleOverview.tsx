import { motion } from 'framer-motion'
import { Thermometer, Cpu, Droplet, Warehouse, ArrowRight, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ModuleType } from '../services/api'
import clsx from 'clsx'
import AnimatedCounter from '../components/AnimatedCounter'

interface ModuleSummary {
  module: ModuleType
  deviceCount: number
  onlineCount: number
  avgScore: number
  alertCount: number
  health: number
}

interface Props {
  moduleStats?: Record<ModuleType, ModuleSummary>
}

const moduleConfig: Record<ModuleType, { label: string; icon: typeof Thermometer; color: string; bgColor: string; path: string }> = {
  'cold-storage': { label: 'Cold Storage', icon: Thermometer, color: 'text-cold-400', bgColor: 'bg-cold-500/10', path: '/cold-storage' },
  'machine-health': { label: 'Machine Health', icon: Cpu, color: 'text-machine-400', bgColor: 'bg-machine-500/10', path: '/machine-health' },
  'water-quality': { label: 'Water Quality', icon: Droplet, color: 'text-water-400', bgColor: 'bg-water-500/10', path: '/water-quality' },
  'warehouse': { label: 'Warehouse', icon: Warehouse, color: 'text-warehouse-400', bgColor: 'bg-warehouse-500/10', path: '/warehouse' },
}

const defaultStats: ModuleSummary[] = [
  { module: 'cold-storage', deviceCount: 0, onlineCount: 0, avgScore: 0, alertCount: 0, health: 0 },
  { module: 'machine-health', deviceCount: 0, onlineCount: 0, avgScore: 0, alertCount: 0, health: 0 },
  { module: 'water-quality', deviceCount: 0, onlineCount: 0, avgScore: 0, alertCount: 0, health: 0 },
  { module: 'warehouse', deviceCount: 0, onlineCount: 0, avgScore: 0, alertCount: 0, health: 0 },
]

export default function ModuleOverview({ moduleStats }: Props) {
  const navigate = useNavigate()
  const stats = moduleStats ? Object.values(moduleStats) : defaultStats

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-300">Module Overview</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const config = moduleConfig[stat.module]
          if (!config) return null
          const Icon = config.icon
          return (
            <motion.div
              key={stat.module}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => navigate(config.path)}
              className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50 cursor-pointer hover:border-gray-700/60 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={clsx('p-2 rounded-lg', config.bgColor)}>
                  <Icon className={clsx('w-5 h-5', config.color)} />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
              <h4 className="text-sm font-medium text-gray-200 mb-1">{config.label}</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-100"><AnimatedCounter value={stat.deviceCount} /></span>
                <span className="text-xs text-gray-500">devices</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {stat.onlineCount} online
                </span>
                <span>Score: <span className={clsx(
                  'font-medium',
                  stat.avgScore > 70 ? 'text-red-400' : stat.avgScore > 40 ? 'text-amber-400' : 'text-emerald-400'
                )}>{stat.avgScore}</span></span>
              </div>
              {stat.alertCount > 0 && (
                <div className="mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">{stat.alertCount} alerts</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
