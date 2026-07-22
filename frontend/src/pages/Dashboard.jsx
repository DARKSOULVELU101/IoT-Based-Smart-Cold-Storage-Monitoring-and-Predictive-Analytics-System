import { motion } from 'framer-motion'
import {
  Cpu, Thermometer, Droplets, Zap, Activity, AlertTriangle,
  Wifi, WifiOff, Wrench, TrendingUp, TrendingDown
} from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useDashboardSummary } from '../lib/hooks'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const COLORS = ['#4F46E5', '#06B6D4', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function Dashboard() {
  const { data, isLoading } = useDashboardSummary()

  if (isLoading) return <LoadingSpinner />

  const summary = data || {}
  const readings = summary.latest_readings || []
  const alerts = summary.recent_alerts || []

  const pieData = [
    { name: 'Online', value: summary.online_devices || 0, fill: '#10B981' },
    { name: 'Offline', value: summary.offline_devices || 0, fill: '#6B7280' },
    { name: 'Maintenance', value: summary.maintenance_devices || 0, fill: '#F59E0B' },
  ].filter(d => d.value > 0)

  const tempData = readings.filter(r => r.temperature != null).map((r, i) => ({
    name: `D${i + 1}`,
    temp: r.temperature,
    humidity: r.humidity,
  }))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time IoT monitoring overview</p>
        </div>
        <Badge variant="online" label="All Systems Operational" />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Cpu} label="Total Devices" value={summary.total_devices || 0} color="primary" />
        <StatCard icon={Wifi} label="Online Devices" value={summary.online_devices || 0} color="green" trend="up" trendValue="Active" />
        <StatCard icon={WifiOff} label="Offline Devices" value={summary.offline_devices || 0} color="red" />
        <StatCard icon={Wrench} label="Maintenance" value={summary.maintenance_devices || 0} color="amber" />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Thermometer} label="Avg Temperature" value={summary.avg_temperature || 0} suffix="°C" color="accent" />
        <StatCard icon={Droplets} label="Avg Humidity" value={summary.avg_humidity || 0} suffix="%" color="secondary" />
        <StatCard icon={Activity} label="Machine Health" value={summary.avg_machine_health || 0} suffix="%" color="green" />
        <StatCard icon={AlertTriangle} label="Active Alerts" value={summary.active_alerts || 0} color="red" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Device Readings</h3>
              <span className="text-xs text-gray-400">Latest telemetry from all devices</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tempData}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="temp" stroke="#4F46E5" fill="url(#tempGrad)" strokeWidth={2} name="Temp (°C)" />
                  <Area type="monotone" dataKey="humidity" stroke="#06B6D4" fill="url(#humGrad)" strokeWidth={2} name="Humidity (%)" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard hover={false} className="h-full">
            <h3 className="font-semibold text-gray-900 mb-4">Device Status</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Alerts</h3>
            <span className="text-xs text-gray-400">{alerts.length} alerts</span>
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No recent alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.severity === 'critical' ? 'text-red-500' :
                      alert.severity === 'high' ? 'text-orange-500' :
                      alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{alert.message}</div>
                      <div className="text-xs text-gray-400">{alert.device_name}</div>
                    </div>
                  </div>
                  <Badge variant={alert.severity} label={alert.severity} />
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
