import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Globe, User, Bell, Moon, Sun, Save, Key, Mail, Smartphone } from 'lucide-react'
import { pageTransition } from '../animations/slideIn'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000')
  const [darkMode, setDarkMode] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [userName, setUserName] = useState('Admin')
  const [userEmail, setUserEmail] = useState('admin@iot-suite.io')

  const handleSave = () => toast.success('Settings saved successfully')

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={clsx('relative w-12 h-6 rounded-full transition-colors duration-200', value ? 'bg-cold-600' : 'bg-gray-600')}>
      <div className={clsx('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200', value ? 'left-7' : 'left-1')} />
    </button>
  )

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
        <motion.div variants={staggerItem}>
          <h2 className="text-xl font-bold text-gray-100">Settings</h2>
          <p className="text-sm text-gray-400">Configure your dashboard preferences</p>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-cold-400" /><h3 className="text-sm font-semibold text-gray-300">API Configuration</h3></div>
          <div><label className="block text-sm text-gray-400 mb-1">Backend API URL</label>
            <input type="url" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="http://localhost:8000" className="input-field" />
            <p className="text-xs text-gray-500 mt-1">The URL of your backend API server</p></div>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4"><User className="w-5 h-5 text-emerald-400" /><h3 className="text-sm font-semibold text-gray-300">User Profile</h3></div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cold-500 to-machine-500 flex items-center justify-center"><User className="w-8 h-8 text-white" /></div>
              <button className="btn-secondary text-xs">Change Avatar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm text-gray-400 mb-1">Email</label>
                <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="input-field" /></div>
            </div>
            <div><label className="block text-sm text-gray-400 mb-1">Password</label>
              <div className="flex gap-2"><input type="password" value="••••••••" disabled className="input-field flex-1" />
                <button className="btn-secondary"><Key className="w-4 h-4" /> Change</button></div></div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            {darkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            <h3 className="text-sm font-semibold text-gray-300">Appearance</h3>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-200">Dark Mode</p><p className="text-xs text-gray-500">Toggle between dark and light theme</p></div>
            <Toggle value={darkMode} onChange={() => { setDarkMode(!darkMode); document.documentElement.classList.toggle('dark') }} />
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4"><Bell className="w-5 h-5 text-amber-400" /><h3 className="text-sm font-semibold text-gray-300">Notification Preferences</h3></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /><div><p className="text-sm text-gray-200">Email Alerts</p><p className="text-xs text-gray-500">Receive alerts via email</p></div></div>
              <Toggle value={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-gray-400" /><div><p className="text-sm text-gray-200">SMS Alerts</p><p className="text-xs text-gray-500">Receive critical alerts via SMS</p></div></div>
              <Toggle value={smsAlerts} onChange={() => setSmsAlerts(!smsAlerts)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Bell className="w-4 h-4 text-gray-400" /><div><p className="text-sm text-gray-200">Critical Only</p><p className="text-xs text-gray-500">Only notify for critical alerts</p></div></div>
              <Toggle value={criticalOnly} onChange={() => setCriticalOnly(!criticalOnly)} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="flex justify-end">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> Save Settings</motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
