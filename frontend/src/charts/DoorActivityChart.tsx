import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format } from 'date-fns'
import type { Reading } from '../services/api'

interface Props {
  readings: Reading[]
  title?: string
}

export default function DoorActivityChart({ readings, title = 'Door Activity' }: Props) {
  const chartData = useMemo(() =>
    readings.map((r) => ({
      time: r.timestamp ? format(new Date(r.timestamp), 'HH:mm') : '',
      doorOpenSeconds: r.doorOpenSeconds,
      isOpen: r.doorOpen ? 1 : 0,
    })).reverse()
  , [readings])

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
            <Tooltip />
            <Bar dataKey="doorOpenSeconds" radius={[4, 4, 0, 0]} animationDuration={500}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.isOpen ? '#ef4444' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
