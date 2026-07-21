import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Server,
  BarChart3,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  Cpu,
  Thermometer,
  Droplets,
  Warehouse,
  Wrench,
  Activity,
  Zap,
  X,
  User,
  LogOut,
} from 'lucide-react'
import clsx from 'clsx'
import { useAppStore } from '../store/appStore'
import { useAuthStore } from '../store/authStore'

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}

const moduleItems = [
  { path: '/cold-storage', label: 'Cold Storage', icon: Thermometer, color: 'text-cold-400' },
  { path: '/machine-health', label: 'Machine Health', icon: Cpu, color: 'text-machine-400' },
  { path: '/water-quality', label: 'Water Quality', icon: Droplets, color: 'text-water-400' },
  { path: '/warehouse', label: 'Warehouse', icon: Warehouse, color: 'text-warehouse-400' },
]

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/devices', label: 'Devices', icon: Server },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const location = useLocation()
  const { toggleSidebar } = useAppStore()
  const { user, logout } = useAuthStore()

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2.5"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-cold-500 to-machine-500">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-gradient">IoT Suite</span>
                <span className="block text-[10px] text-gray-500 -mt-0.5">Analytics Platform</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-cold-500 to-machine-500 mx-auto">
            <Activity className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={clsx(
            'hidden lg:flex p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400',
            collapsed && 'mx-auto mt-2'
          )}
        >
          <ChevronLeft className={clsx('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
            Overview
          </p>
        )}
        {navItems.slice(0, 2).map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={clsx(
                active ? 'nav-link-active' : 'nav-link',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden text-[13px]"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}

        {!collapsed && (
          <p className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
            Modules
          </p>
        )}
        {moduleItems.map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={clsx(
                active ? 'nav-link-active' : 'nav-link',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className={clsx('w-[18px] h-[18px] flex-shrink-0', active ? item.color : '')} />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden text-[13px]"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && active && (
                <motion.div
                  layoutId="module-indicator"
                  className={clsx('ml-auto w-1.5 h-1.5 rounded-full', item.color.replace('text-', 'bg-'))}
                />
              )}
            </NavLink>
          )
        })}

        {!collapsed && (
          <p className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
            System
          </p>
        )}
        {navItems.slice(2).map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={clsx(
                active ? 'nav-link-active' : 'nav-link',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden text-[13px]"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>

      <div className={clsx('p-3 border-t border-gray-800/50', collapsed && 'px-2')}>
        <div className={clsx(
          'flex items-center gap-3 p-2 rounded-lg bg-gray-800/30',
          collapsed && 'justify-center'
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cold-500 to-machine-500 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email || 'admin@iot-suite.io'}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-500 hover:text-gray-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex glass-sidebar flex-col h-screen sticky top-0 z-30"
      >
        {sidebarContent}
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-[260px] glass-sidebar z-50 lg:hidden"
            >
              <div className="flex items-center justify-end p-2">
                <button
                  onClick={onCloseMobile}
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
