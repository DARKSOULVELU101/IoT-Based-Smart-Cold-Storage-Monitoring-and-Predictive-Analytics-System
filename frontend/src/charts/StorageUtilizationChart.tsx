import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface StorageData {
  zone: string
  used: number
  total: number
}

interface Props {
  data: StorageData[]
  title?: string
}

export default function StorageUtilizationChart({ data, title = 'Storage Utilization' }: Props) {
  const chartData = useMemo(() =>
    data.map((d) => ({
      zone: d.zone,
      utilization: Math.round((d.used / Math.max(d.total, 1)) * 100),
      used: d.used,
      total: d.total,
    }))
  , [data])

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="zone" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={[0, 100]}
              tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Bar dataKey="utilization" radius={[4, 4, 0, 0]} animationDuration={500} fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
