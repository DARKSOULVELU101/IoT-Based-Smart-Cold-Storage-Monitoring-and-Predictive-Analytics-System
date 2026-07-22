import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LoadingSpinner from './components/ui/LoadingSpinner'

const LandingPage = lazy(() => import('./components/landing/LandingPage'))
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DigitalTwin = lazy(() => import('./pages/DigitalTwin'))
const Devices = lazy(() => import('./pages/Devices'))
const DeviceHealth = lazy(() => import('./pages/DeviceHealth'))
const AnalyticsHub = lazy(() => import('./pages/AnalyticsHub'))
const TemperatureAnalytics = lazy(() => import('./pages/TemperatureAnalytics'))
const MachineHealthAnalytics = lazy(() => import('./pages/MachineHealthAnalytics'))
const WaterQualityAnalytics = lazy(() => import('./pages/WaterQualityAnalytics'))
const WarehouseAnalytics = lazy(() => import('./pages/WarehouseAnalytics'))
const PredictiveAnalytics = lazy(() => import('./pages/PredictiveAnalytics'))
const Alerts = lazy(() => import('./pages/Alerts'))
const AuditLogs = lazy(() => import('./pages/AuditLogs'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))

function SuspenseWrapper({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <LoadingSpinner />
      </div>
    }>
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SuspenseWrapper><LandingPage /></SuspenseWrapper>} />
      <Route element={<SuspenseWrapper><DashboardLayout /></SuspenseWrapper>}>
        <Route path="/dashboard" element={<SuspenseWrapper><Dashboard /></SuspenseWrapper>} />
        <Route path="/digital-twin" element={<SuspenseWrapper><DigitalTwin /></SuspenseWrapper>} />
        <Route path="/devices" element={<SuspenseWrapper><Devices /></SuspenseWrapper>} />
        <Route path="/device-health" element={<SuspenseWrapper><DeviceHealth /></SuspenseWrapper>} />
        <Route path="/analytics" element={<SuspenseWrapper><AnalyticsHub /></SuspenseWrapper>} />
        <Route path="/analytics/temperature" element={<SuspenseWrapper><TemperatureAnalytics /></SuspenseWrapper>} />
        <Route path="/analytics/machine-health" element={<SuspenseWrapper><MachineHealthAnalytics /></SuspenseWrapper>} />
        <Route path="/analytics/water-quality" element={<SuspenseWrapper><WaterQualityAnalytics /></SuspenseWrapper>} />
        <Route path="/analytics/warehouse" element={<SuspenseWrapper><WarehouseAnalytics /></SuspenseWrapper>} />
        <Route path="/analytics/predictive" element={<SuspenseWrapper><PredictiveAnalytics /></SuspenseWrapper>} />
        <Route path="/alerts" element={<SuspenseWrapper><Alerts /></SuspenseWrapper>} />
        <Route path="/audit-logs" element={<SuspenseWrapper><AuditLogs /></SuspenseWrapper>} />
        <Route path="/reports" element={<SuspenseWrapper><Reports /></SuspenseWrapper>} />
        <Route path="/settings" element={<SuspenseWrapper><Settings /></SuspenseWrapper>} />
        <Route path="/profile" element={<SuspenseWrapper><Profile /></SuspenseWrapper>} />
      </Route>
    </Routes>
  )
}
