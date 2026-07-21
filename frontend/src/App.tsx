import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ColdStorage from './pages/ColdStorage'
import MachineHealth from './pages/MachineHealth'
import WaterQuality from './pages/WaterQuality'
import Warehouse from './pages/Warehouse'
import DeviceList from './pages/DeviceList'
import DeviceDetail from './pages/DeviceDetail'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import Maintenance from './pages/Maintenance'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { useAuthStore } from './store/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="cold-storage" element={<ColdStorage />} />
        <Route path="cold-storage/:id" element={<DeviceDetail />} />
        <Route path="machine-health" element={<MachineHealth />} />
        <Route path="machine-health/:id" element={<DeviceDetail />} />
        <Route path="water-quality" element={<WaterQuality />} />
        <Route path="water-quality/:id" element={<DeviceDetail />} />
        <Route path="warehouse" element={<Warehouse />} />
        <Route path="warehouse/:id" element={<DeviceDetail />} />
        <Route path="devices" element={<DeviceList />} />
        <Route path="devices/:id" element={<DeviceDetail />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
