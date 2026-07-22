import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Cpu, BarChart3, Bell, FileText, Settings, User,
  Thermometer, Droplets, Warehouse, TrendingUp, ChevronDown, ChevronLeft,
  Activity, Menu
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/devices', label: 'Devices', icon: Cpu },
  {
    label: 'Analytics', icon: BarChart3, children: [
      { path: '/analytics/temperature', label: 'Temperature', icon: Thermometer },
      { path: '/analytics/machine-health', label: 'Machine Health', icon: Activity },
      { path: '/analytics/water-quality', label: 'Water Quality', icon: Droplets },
      { path: '/analytics/warehouse', label: 'Warehouse', icon: Warehouse },
      { path: '/analytics/predictive', label: 'Predictive', icon: TrendingUp },
    ]
  },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/profile', label: 'Profile', icon: User },
]

function NavItem({ item, collapsed }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const hasChildren = item.children?.length > 0
  const isActive = hasChildren
    ? item.children.some(c => location.pathname === c.path)
    : location.pathname === item.path

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            collapsed && 'justify-center'
          )}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown className={clsx('w-4 h-4 transition-transform', open && 'rotate-180')} />
            </>
          )}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden ml-4 mt-1"
            >
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 mb-0.5',
                    isActive ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  )}
                >
                  <child.icon className="w-4 h-4" />
                  {child.label}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        isActive ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        collapsed && 'justify-center'
      )}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <motion.aside
      className={clsx(
        'glass-sidebar h-screen fixed left-0 top-0 z-40 flex flex-col transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">IoT Suite</div>
              <div className="text-[10px] text-gray-400">Analytics Platform</div>
            </div>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        {!collapsed && (
          <div className="glass-card rounded-xl p-3">
            <div className="text-xs font-medium text-gray-600 mb-1">Created by</div>
            <div className="text-sm font-bold gradient-text">NARENDRAMEL</div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
