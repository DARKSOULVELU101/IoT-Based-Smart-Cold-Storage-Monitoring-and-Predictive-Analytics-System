import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Bell,
  LogOut,
  User,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useActiveAlerts } from '@/hooks/useAlerts'
import { cn } from '@/lib/utils'

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/devices': 'Devices',
  '/zones': 'Zone Comparison',
  '/analytics': 'Analytics',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { data: activeAlerts } = useActiveAlerts()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const pageTitle = routeNames[location.pathname] || 'Dashboard'
  const alertCount = activeAlerts?.length || 0

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-card/40 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>ColdWatch</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{pageTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search devices, alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-64 pl-10 text-sm"
          />
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
              >
                {alertCount > 99 ? '99+' : alertCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/[0.08] bg-card/95 shadow-2xl backdrop-blur-xl"
              >
                <div className="border-b border-white/[0.06] p-4">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <p className="text-xs text-muted-foreground">{alertCount} active alerts</p>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {activeAlerts?.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white/[0.04]"
                    >
                      <div
                        className={cn(
                          'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                          alert.level === 'critical' && 'bg-red-400',
                          alert.level === 'warning' && 'bg-yellow-400',
                          alert.level === 'info' && 'bg-blue-400'
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{alert.message}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {alert.device_name} · {alert.zone}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!activeAlerts || activeAlerts.length === 0) && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No active notifications
                    </div>
                  )}
                </div>
                {alertCount > 0 && (
                  <div className="border-t border-white/[0.06] p-2">
                    <button
                      onClick={() => {
                        navigate('/alerts')
                        setShowNotifications(false)
                      }}
                      className="w-full rounded-lg py-2 text-center text-sm text-primary transition-colors hover:bg-white/[0.04]"
                    >
                      View all alerts
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-white/[0.04]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="hidden text-sm font-medium md:block">
              {user?.username || 'Admin'}
            </span>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/[0.08] bg-card/95 shadow-2xl backdrop-blur-xl"
              >
                <div className="p-1">
                  <button
                    onClick={() => {
                      navigate('/settings')
                      setShowUserMenu(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
