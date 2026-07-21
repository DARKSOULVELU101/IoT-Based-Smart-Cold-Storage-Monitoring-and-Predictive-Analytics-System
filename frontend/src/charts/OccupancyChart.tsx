import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface OccupancyData {
  zone: string
  current: number
  capacity: number
}

interface Props {
  data: OccupancyData[]
  title?: string
}

export default function OccupancyChart({ data, title = 'Zone Occupancy' }: Props) {
  const chartData = useMemo(() =>
    data.map((d) => ({
      zone: d.zone,
      occupied: d.current,
      available: Math.max(d.capacity - d.current, 0),
      utilization: Math.round((d.current / Math.max(d.capacity, 1)) * 100),
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
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
            <Tooltip />
            <Bar dataKey="occupied" stackId="a" radius={[0, 0, 0, 0]} animationDuration={500}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.utilization > 90 ? '#ef4444' : entry.utilization > 70 ? '#f59e0b' : '#f97316'} />
              ))}
            </Bar>
            <Bar dataKey="available" stackId="a" radius={[4, 4, 0, 0]} fill="#374151" animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
