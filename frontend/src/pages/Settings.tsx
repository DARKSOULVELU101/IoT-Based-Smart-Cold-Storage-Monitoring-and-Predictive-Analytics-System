import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Key,
  Palette,
  Info,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function Settings() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    criticalOnly: false,
  })

  const sections = [
    {
      title: 'User Profile',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.username || 'Admin'}</p>
              <p className="text-sm text-muted-foreground">{user?.email || 'admin@coldwatch.io'}</p>
              <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Username</label>
              <input
                type="text"
                defaultValue={user?.username || 'admin'}
                className="glass-input w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                defaultValue={user?.email || 'admin@coldwatch.io'}
                className="glass-input w-full text-sm"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive alerts via email' },
            { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
            { key: 'criticalOnly', label: 'Critical Only', desc: 'Only notify for critical alerts' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    [item.key]: !notifications[item.key as keyof typeof notifications],
                  })
                }
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-white/[0.1]'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                    notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'API Keys',
      icon: Key,
      content: (
        <div className="space-y-3">
          <div className="rounded-lg bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Production Key</p>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <code className="block rounded bg-white/[0.03] p-2 text-xs text-muted-foreground font-mono">
              cwt_prod_****_****_****_****_a3f2
            </code>
            <p className="mt-2 text-[10px] text-muted-foreground">Created: Jan 1, 2024 · Last used: 2 hours ago</p>
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.08] px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-white/[0.15] hover:text-foreground">
            <Key className="h-4 w-4" />
            Generate New Key
          </button>
        </div>
      ),
    },
    {
      title: 'Appearance',
      icon: Palette,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Dark', icon: Moon, active: true },
              { label: 'Light', icon: Sun, active: false },
              { label: 'System', icon: Monitor, active: false },
            ].map((theme) => {
              const Icon = theme.icon
              return (
                <button
                  key={theme.label}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-4 transition-all',
                    theme.active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/[0.08] text-muted-foreground hover:border-white/[0.15]'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{theme.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ),
    },
    {
      title: 'System Info',
      icon: Info,
      content: (
        <div className="space-y-2">
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Build', value: '2024.01.15' },
            { label: 'API Endpoint', value: import.meta.env.VITE_API_URL || 'http://localhost:8000' },
            { label: 'Environment', value: import.meta.env.MODE || 'development' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and application preferences
        </p>
      </motion.div>

      {sections.map((section, index) => {
        const Icon = section.icon
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="glass-card p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">{section.title}</h3>
            </div>
            {section.content}
          </motion.div>
        )
      })}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end pb-6"
      >
        <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Save Changes
          <ChevronRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  )
}
