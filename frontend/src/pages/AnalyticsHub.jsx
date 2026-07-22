import { motion } from 'framer-motion'
import { Thermometer, Activity, Droplets, Warehouse, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const analyticsPages = [
  { path: '/analytics/temperature', icon: Thermometer, title: 'Temperature Analytics', desc: 'Track temperature trends across all cold storage and warehouse devices', color: 'from-blue-500 to-indigo-600' },
  { path: '/analytics/machine-health', icon: Activity, title: 'Machine Health', desc: 'Monitor vibration, health scores and predict maintenance needs', color: 'from-emerald-500 to-teal-600' },
  { path: '/analytics/water-quality', icon: Droplets, title: 'Water Quality', desc: 'pH, turbidity, TDS and water quality score analytics', color: 'from-cyan-500 to-blue-600' },
  { path: '/analytics/warehouse', icon: Warehouse, title: 'Warehouse Analytics', desc: 'Environment conditions and risk assessment for storage areas', color: 'from-amber-500 to-orange-600' },
  { path: '/analytics/predictive', icon: TrendingUp, title: 'Predictive Analytics', desc: 'AI-powered forecasting and trend prediction', color: 'from-purple-500 to-pink-600' },
]

export default function AnalyticsHub() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Deep insights from your IoT telemetry data</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsPages.map((page) => (
          <motion.div key={page.path} variants={item}>
            <Link to={page.path}>
              <GlassCard className="h-full group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${page.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <page.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{page.title}</h3>
                <p className="text-sm text-gray-500">{page.desc}</p>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
