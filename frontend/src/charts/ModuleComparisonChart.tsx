import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import type { ModuleType } from '../services/api'

interface ModuleData {
  module: ModuleType
  deviceCount: number
  onlineCount: number
  avgScore: number
  alertCount: number
  health: number
}

interface Props {
  data: Record<ModuleType, ModuleData>
  title?: string
}

const moduleLabels: Record<ModuleType, string> = {
  'cold-storage': 'Cold Storage',
  'machine-health': 'Machine Health',
  'water-quality': 'Water Quality',
  'warehouse': 'Warehouse',
}

const moduleColors: Record<ModuleType, string> = {
  'cold-storage': '#3380ff',
  'machine-health': '#d946ef',
  'water-quality': '#06b6d4',
  'warehouse': '#f97316',
}

export default function ModuleComparisonChart({ data, title = 'Module Comparison' }: Props) {
  const chartData = useMemo(() =>
    Object.entries(data).map(([key, val]) => ({
      module: moduleLabels[key as ModuleType] || key,
      health: val.health,
      devices: val.deviceCount,
      alerts: val.alertCount,
      color: moduleColors[key as ModuleType] || '#6b7280',
    }))
  , [data])

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="module" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={[0, 100]} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="health" name="Health %" radius={[4, 4, 0, 0]} animationDuration={500}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
