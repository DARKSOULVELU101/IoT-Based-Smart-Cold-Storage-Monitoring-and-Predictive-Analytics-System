import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, Search, X, Check } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { useAppStore } from '../store/appStore'
import { useUnreadNotificationCount, useNotifications } from '../hooks/useNotifications'
import { format } from 'date-fns'
import apiClient from '../services/api'

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/devices': 'Devices',
  '/analytics': 'Analytics',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/maintenance': 'Maintenance',
  '/cold-storage': 'Cold Storage',
  '/machine-health': 'Machine Health',
  '/water-quality': 'Water Quality',
  '/warehouse': 'Warehouse',
  '/login': 'Login',
}

const moduleBreadcrumbs: Record<string, string[]> = {
  '/cold-storage': ['Modules', 'Cold Storage'],
  '/machine-health': ['Modules', 'Machine Health'],
  '/water-quality': ['Modules', 'Water Quality'],
  '/warehouse': ['Modules', 'Warehouse'],
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setSidebarMobileOpen, notificationsOpen, setNotificationsOpen } = useAppStore()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  const { data: notifications = [] } = useNotifications()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const breadcrumbs = moduleBreadcrumbs[location.pathname]
  const currentPage = pageNames[location.pathname] || location.pathname.split('/').pop() || 'Dashboard'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [setNotificationsOpen])

  const handleMarkAllRead = async () => {
    try {
      await apiClient.notifications.markAllRead()
    } catch {}
  }

  return (
    <header className="glass-header sticky top-0 z-20 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            {breadcrumbs && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                {breadcrumbs.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span>/</span>}
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-lg font-semibold text-gray-100">{currentPage}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center">
            <div className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200',
              searchFocused
                ? 'bg-gray-800 border-gray-700 w-72'
                : 'bg-transparent border-transparent hover:bg-gray-800/50'
            )}>
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices, alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={clsx(
                  'bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500 transition-all duration-200',
                  searchFocused ? 'w-full' : 'w-0'
                )}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between p-3 border-b border-gray-800/50">
                    <span className="text-sm font-semibold text-gray-200">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-cold-400 hover:text-cold-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={clsx(
                            'p-3 border-b border-gray-800/30 hover:bg-gray-800/30 transition-colors',
                            !n.read && 'bg-cold-500/5'
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div className={clsx(
                              'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                              n.type === 'error' && 'bg-red-400',
                              n.type === 'warning' && 'bg-amber-400',
                              n.type === 'success' && 'bg-emerald-400',
                              n.type === 'info' && 'bg-cold-400',
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-200">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-gray-600 mt-1">
                                {format(new Date(n.createdAt), 'MMM d, HH:mm')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
