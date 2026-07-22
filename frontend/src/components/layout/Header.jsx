import { Bell, Search, ChevronRight, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'

const breadcrumbMap = {
  '/dashboard': 'Dashboard',
  '/devices': 'Devices',
  '/analytics': 'Analytics',
  '/analytics/temperature': 'Temperature Analytics',
  '/analytics/machine-health': 'Machine Health Analytics',
  '/analytics/water-quality': 'Water Quality Analytics',
  '/analytics/warehouse': 'Warehouse Analytics',
  '/analytics/predictive': 'Predictive Analytics',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'User Profile',
}

export default function Header() {
  const location = useLocation()
  const pageName = breadcrumbMap[location.pathname] || 'Dashboard'
  const segments = location.pathname.split('/').filter(Boolean)

  return (
    <motion.header
      className="h-16 glass-panel border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 text-sm">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">Home</Link>
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className={i === segments.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}>
              {breadcrumbMap['/' + segments.slice(0, i + 1).join('/')] || seg}
            </span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices, alerts..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          />
        </div>
        <button className="relative p-2 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <Link to="/profile" className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white">
          <User className="w-4 h-4" />
        </Link>
      </div>
    </motion.header>
  )
}
