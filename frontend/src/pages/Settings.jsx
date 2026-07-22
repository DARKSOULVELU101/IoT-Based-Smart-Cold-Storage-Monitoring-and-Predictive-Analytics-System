import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Bell, Shield, Palette, Database, Globe } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

function SettingRow({ icon: Icon, label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-gray-500" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-400">{description}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure your IoT monitoring platform</p>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
          <SettingRow icon={Bell} label="Push Notifications" description="Receive alerts in your browser">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </SettingRow>
          <SettingRow icon={Bell} label="Email Alerts" description="Get email notifications for critical alerts">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </SettingRow>
        </GlassCard>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-4">Data & Privacy</h3>
          <SettingRow icon={Database} label="Data Retention" description="Keep telemetry data for 90 days">
            <select className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option>30 days</option>
              <option>60 days</option>
              <option selected>90 days</option>
              <option>1 year</option>
            </select>
          </SettingRow>
          <SettingRow icon={Globe} label="API Access" description="Allow external API access with token">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </SettingRow>
        </GlassCard>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-4">Appearance</h3>
          <SettingRow icon={Palette} label="Theme" description="Select dashboard theme">
            <select className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option selected>Light (Enterprise)</option>
              <option>System</option>
            </select>
          </SettingRow>
        </GlassCard>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-gray-900 mb-4">Danger Zone</h3>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-gray-900">Reset All Data</div>
              <div className="text-xs text-gray-400">Remove all telemetry data and alerts</div>
            </div>
            <Button variant="danger" size="sm">Reset</Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
