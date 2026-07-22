import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Cpu, Plus, Search, Edit2, Trash2, Power, PowerOff, RefreshCw,
  Wifi, WifiOff, Wrench, Filter
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useDevices, useCreateDevice, useDeleteDevice } from '../lib/hooks'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function Devices() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newDevice, setNewDevice] = useState({ name: '', device_type: 'cold_storage', location: '' })

  const { data: devices, isLoading } = useDevices({ search, device_type: filterType, status: filterStatus })
  const createDevice = useCreateDevice()
  const deleteDevice = useDeleteDevice()

  if (isLoading) return <LoadingSpinner />

  const handleCreate = () => {
    if (!newDevice.name) return
    createDevice.mutate(newDevice, {
      onSuccess: () => { setShowModal(false); setNewDevice({ name: '', device_type: 'cold_storage', location: '' }) }
    })
  }

  const typeIcons = { cold_storage: Cpu, machine_water: RefreshCw, warehouse: Cpu }
  const typeLabels = { cold_storage: 'Cold Storage', machine_water: 'Machine/Water', warehouse: 'Warehouse' }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
          <p className="text-sm text-gray-500">Manage and monitor all connected IoT devices</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Register Device</Button>
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search devices..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Types</option>
          <option value="cold_storage">Cold Storage</option>
          <option value="machine_water">Machine/Water</option>
          <option value="warehouse">Warehouse</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(devices || []).map((device) => {
          const Icon = typeIcons[device.device_type] || Cpu
          return (
            <GlassCard key={device.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{device.name}</h3>
                    <p className="text-xs text-gray-400">{typeLabels[device.device_type]}</p>
                  </div>
                </div>
                <Badge variant={device.status} label={device.status} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Location</span>
                  <span className="text-gray-600">{device.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">IP Address</span>
                  <span className="text-gray-600">{device.ip_address || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Firmware</span>
                  <span className="text-gray-600">v{device.firmware_version}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => deleteDevice.mutate(device.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </GlassCard>
          )
        })}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <motion.div
            className="glass-card rounded-2xl p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Register New Device</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Device Name</label>
                <input
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="e.g. Cold Storage Unit D"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Device Type</label>
                <select
                  value={newDevice.device_type}
                  onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="cold_storage">Cold Storage</option>
                  <option value="machine_water">Machine/Water</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                <input
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="e.g. Warehouse 4 - Zone C"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleCreate}>Register</Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
