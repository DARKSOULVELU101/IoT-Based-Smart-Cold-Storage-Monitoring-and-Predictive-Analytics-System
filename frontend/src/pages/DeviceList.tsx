import { useState, useMemo } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Plus, Grid3X3, List, Search, Filter, X } from 'lucide-react'
import { useLatestReadings } from '../hooks/useReadings'
import { useDevices, useRegisterDevice } from '../hooks/useDevices'
import DeviceCard from '../components/DeviceCard'
import ModuleTabBar from '../components/ModuleTabBar'
import { PageSkeleton } from '../components/LoadingSkeleton'
import { pageTransition } from '../animations/slideIn'
import { staggerContainer, staggerItem } from '../animations/fadeIn'
import clsx from 'clsx'

const zones = ['All', 'DAIRY', 'MEAT', 'VEGETABLES', 'FROZEN', 'PHARMA', 'PRODUCTION', 'PACKAGING', 'OFFICE', 'STORAGE']

export default function DeviceList() {
  const { data: readings = [], isLoading: readingsLoading } = useLatestReadings()
  const { data: devices = [] } = useDevices()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedZone, setSelectedZone] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      const matchesSearch = r.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesZone = selectedZone === 'All' || r.zone === selectedZone
      return matchesSearch && matchesZone
    })
  }, [readings, searchQuery, selectedZone])

  if (readingsLoading) return <PageSkeleton />

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <motion.div variants={staggerItem}><ModuleTabBar /></motion.div>

      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Device Management</h2>
          <p className="text-sm text-gray-400">{filteredReadings.length} devices found</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowRegisterModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />Register Device
        </motion.button>
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search devices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={clsx('btn-secondary', showFilters && 'bg-gray-800 border-cold-500/50')}>
            <Filter className="w-4 h-4" />Filters
          </button>
          <div className="flex rounded-lg border border-gray-700/50 overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={clsx('p-2 transition-colors', viewMode === 'grid' ? 'bg-gray-800 text-cold-400' : 'text-gray-500 hover:text-gray-300')}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={clsx('p-2 transition-colors', viewMode === 'list' ? 'bg-gray-800 text-cold-400' : 'text-gray-500 hover:text-gray-300')}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 overflow-hidden">
            {zones.map((zone) => (
              <motion.button key={zone} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedZone(zone)}
                className={clsx('px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
                  selectedZone === zone ? 'bg-cold-500/20 border-cold-500/50 text-cold-400' : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-gray-200')}>
                {zone}{selectedZone === zone && zone !== 'All' && <X className="inline w-3 h-3 ml-1" />}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <LayoutGroup>
        <AnimatePresence mode="wait">
          {filteredReadings.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No devices found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div key="grid" variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredReadings.map((reading, index) => (
                <motion.div key={reading.deviceId} variants={staggerItem} layout><DeviceCard reading={reading} index={index} /></motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="list" variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
              {filteredReadings.map((reading) => (
                <motion.div key={reading.deviceId} variants={staggerItem} layout className="glass-card p-4 flex items-center gap-4 hover:border-gray-700/60 transition-colors cursor-pointer">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: reading.status === 'SAFE' ? '#10b981' : reading.status === 'WARNING' ? '#f59e0b' : reading.status === 'CRITICAL' ? '#ef4444' : '#6b7280' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-200 truncate">{reading.deviceId}</p>
                    <p className="text-xs text-gray-500">{reading.zone} • {reading.module || 'cold-storage'}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
                    <span>{reading.temperature.toFixed(1)}°C</span>
                    <span>{reading.humidity.toFixed(1)}%</span>
                    <span className={clsx('font-medium', reading.riskScore > 70 ? 'text-red-400' : reading.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400')}>Risk: {reading.riskScore}</span>
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs', reading.status === 'SAFE' && 'bg-emerald-500/10 text-emerald-400', reading.status === 'WARNING' && 'bg-amber-500/10 text-amber-400', reading.status === 'CRITICAL' && 'bg-red-500/10 text-red-400', reading.status === 'OFFLINE' && 'bg-gray-500/10 text-gray-400')}>{reading.status}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

      <AnimatePresence>
        {showRegisterModal && <RegisterDeviceModal onClose={() => setShowRegisterModal(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}

function RegisterDeviceModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [zone, setZone] = useState('DAIRY')
  const [type, setType] = useState('TEMPERATURE_SENSOR')
  const [module, setModule] = useState('cold-storage')
  const registerMutation = useRegisterDevice()

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 z-50" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="glass-strong w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Register New Device</h3>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-400 mb-1">Device Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., COLD_ROOM_01" className="input-field" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Module</label>
              <select value={module} onChange={(e) => setModule(e.target.value)} className="select-field">
                <option value="cold-storage">Cold Storage</option>
                <option value="machine-health">Machine Health</option>
                <option value="water-quality">Water Quality</option>
                <option value="warehouse">Warehouse</option>
              </select></div>
            <div><label className="block text-sm text-gray-400 mb-1">Zone</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)} className="select-field">
                <option value="DAIRY">Dairy</option><option value="MEAT">Meat</option><option value="VEGETABLES">Vegetables</option>
                <option value="FROZEN">Frozen</option><option value="PHARMA">Pharma</option><option value="PRODUCTION">Production</option>
                <option value="PACKAGING">Packaging</option><option value="OFFICE">Office</option><option value="STORAGE">Storage</option>
              </select></div>
            <div><label className="block text-sm text-gray-400 mb-1">Device Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="select-field">
                <option value="TEMPERATURE_SENSOR">Temperature Sensor</option><option value="HUMIDITY_SENSOR">Humidity Sensor</option>
                <option value="DOOR_SENSOR">Door Sensor</option><option value="GAS_SENSOR">Gas Sensor</option>
                <option value="COMPRESSOR_MONITOR">Compressor Monitor</option><option value="VIBRATION_SENSOR">Vibration Sensor</option>
                <option value="PH_SENSOR">pH Sensor</option><option value="FLOW_SENSOR">Flow Sensor</option>
                <option value="MOTION_SENSOR">Motion Sensor</option><option value="AIR_QUALITY_SENSOR">Air Quality Sensor</option>
              </select></div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={onClose} className="btn-primary">Register</button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
