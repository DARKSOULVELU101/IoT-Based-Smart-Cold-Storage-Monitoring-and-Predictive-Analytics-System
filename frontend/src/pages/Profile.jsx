import { motion } from 'framer-motion'
import { User, Mail, Shield, Calendar, Cpu } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function Profile() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="text-sm text-gray-500">Manage your account settings</p>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-bold">
              N
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">NARENDRAMEL</h2>
              <p className="text-sm text-gray-500">Administrator</p>
              <p className="text-xs text-gray-400 mt-1">Creator of IoT Analytics Suite</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
              <input
                defaultValue="NARENDRAMEL"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input
                defaultValue="naren@iot-suite.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
              <input
                defaultValue="Administrator"
                disabled
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400"
              />
            </div>
            <div className="pt-4">
              <Button>Save Changes</Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-4">Activity</h3>
          <div className="space-y-3">
            {[
              { icon: Cpu, action: 'Registered 8 IoT devices', time: 'Today' },
              { icon: Shield, action: 'Updated security settings', time: 'Yesterday' },
              { icon: Calendar, action: 'Generated monthly report', time: '3 days ago' },
              { icon: User, action: 'Account created', time: '1 month ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <activity.icon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{activity.action}</div>
                </div>
                <div className="text-xs text-gray-400">{activity.time}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
