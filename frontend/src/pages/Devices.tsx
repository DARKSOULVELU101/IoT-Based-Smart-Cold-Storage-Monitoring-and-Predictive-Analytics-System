import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Filter,
  Server,
  Thermometer,
  Droplets,
  Shield,
  Power,
  Trash2,
  X,
  DoorOpen,
  Zap,
} from 'lucide-react'
import { DeviceCard } from '@/components/DeviceCard'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { StatusIndicator } from '@/components/StatusIndicator'
import { ZoneBadge } from '@/components/ZoneBadge'
import { RiskBadge } from '@/components/RiskBadge'
import { useDevices, useCreateDevice, useDeleteDevice, useDisableDevice, useEnableDevice } from '@/hooks/useDevices'
import { cn } from '@/lib/utils'
import type { Device } from '@/services/api'

export function Devices() {
  const { data: devices, isLoading } = useDevices()
  const createDevice = useCreateDevice()
  const deleteDevice = useDeleteDevice()
  const disableDevice = useDisableDevice()
  const enableDevice = useEnableDevice()

  const [showRegister, setShowRegister] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [filterZone, setFilterZone] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [newDevice, setNewDevice] = useState({ name: '', zone: 'DAIRY' })

  const zones = ['all', 'DAIRY', 'MEDICINE', 'VEGETABLE']
  const statuses = ['all', 'online', 'offline', 'disabled']

  const filteredDevices = devices?.filter((d) => {
    if (filterZone !== 'all' && d.zone !== filterZone) return false
    if (filterStatus !== 'all' && d.status !== filterStatus) return false
    return true
  })

  const handleRegister = async () => {
    if (!newDevice.name.trim()) return
    await createDevice.mutateAsync({
      name: newDevice.name,
      zone: newDevice.zone,
      status: 'online',
    })
    setNewDevice({ name: '', zone: 'DAIRY' })
    setShowRegister(false)
  }

  const handleDelete = async (device: Device) => {
    if (window.confirm(`Delete device "${device.name}"?`)) {
      await deleteDevice.mutateAsync(device.id)
      setSelectedDevice(null)
    }
  }

  const handleToggleDevice = async (device: Device) => {
    if (device.status === 'disabled') {
      await enableDevice.mutateAsync(device.id)
    } else {
      await disableDevice.mutateAsync(device.id)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Devices</h1>
          <p className="text-sm text-muted-foreground">
            Manage your cold storage monitoring devices
          </p>
        </div>
        <button
          onClick={() => setShowRegister(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Register Device
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Zone:</span>
          <div className="flex gap-1">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setFilterZone(zone)}
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                  filterZone === zone
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-white/[0.04]'
                )}
              >
                {zone === 'all' ? 'All' : zone}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <div className="flex gap-1">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors',
                  filterStatus === status
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-white/[0.04]'
                )}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-[200px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDevices?.map((device, index) => (
            <DeviceCard
              key={device.id}
              device={device}
              index={index}
              onView={setSelectedDevice}
              onDisable={handleToggleDevice}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {filteredDevices && filteredDevices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Server className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No devices match your filters</p>
        </motion.div>
      )}

      <AnimatePresence>
        {showRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRegister(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Register New Device</h2>
                <button onClick={() => setShowRegister(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Device Name</label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    placeholder="e.g., Fridge Unit 01"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Zone</label>
                  <div className="flex gap-2">
                    {['DAIRY', 'MEDICINE', 'VEGETABLE'].map((zone) => (
                      <button
                        key={zone}
                        onClick={() => setNewDevice({ ...newDevice, zone })}
                        className={cn(
                          'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                          newDevice.zone === zone
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-white/[0.08] text-muted-foreground hover:border-white/[0.15]'
                        )}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleRegister}
                  disabled={!newDevice.name.trim() || createDevice.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {createDevice.isPending ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedDevice(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <Server className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedDevice.name}</h2>
                    <div className="flex items-center gap-2">
                      <ZoneBadge zone={selectedDevice.zone} />
                      <StatusIndicator status={selectedDevice.status} showLabel />
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedDevice(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Temperature', value: `${selectedDevice.temperature?.toFixed(1)}°C`, icon: Thermometer, color: 'text-blue-400' },
                  { label: 'Humidity', value: `${selectedDevice.humidity?.toFixed(1)}%`, icon: Droplets, color: 'text-cyan-400' },
                  { label: 'Risk Score', value: `${Math.round(selectedDevice.risk_score)}`, icon: Shield, color: 'text-amber-400', extra: <RiskBadge score={selectedDevice.risk_score} /> },
                  { label: 'Compressor', value: `${selectedDevice.compressor_current?.toFixed(1)}A`, icon: Zap, color: 'text-yellow-400' },
                  { label: 'Door Status', value: selectedDevice.door_status, icon: DoorOpen, color: 'text-purple-400' },
                  { label: 'Power', value: selectedDevice.power_status, icon: Power, color: 'text-emerald-400' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
                      <Icon className={cn('h-5 w-5', item.color)} />
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium capitalize">{item.value}</p>
                        {item.extra}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleToggleDevice(selectedDevice)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/[0.04]"
                >
                  <Power className="h-4 w-4" />
                  {selectedDevice.status === 'disabled' ? 'Enable' : 'Disable'}
                </button>
                <button
                  onClick={() => handleDelete(selectedDevice)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
