import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import type { Reading } from '../services/api'

interface Props {
  readings: Reading[]
  title?: string
}

export default function RealtimeLineChart({ readings, title = 'Temperature & Humidity' }: Props) {
  const chartData = useMemo(() =>
    readings.map((r) => ({
      time: r.timestamp ? format(new Date(r.timestamp), 'HH:mm:ss') : r.deviceId,
      temperature: r.temperature,
      humidity: r.humidity,
    })).reverse()
  , [readings])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null
    return (
      <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300 capitalize">{entry.dataKey}:</span>
            <span className="font-medium text-gray-100">
              {entry.dataKey === 'temperature' ? `${entry.value}°C` : `${entry.value}%`}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis yAxisId="temp" stroke="#6b7280" fontSize={11} tickLine={false}
              label={{ value: '°C', position: 'insideTopLeft', offset: 10, style: { fill: '#6b7280', fontSize: 11 } }} />
            <YAxis yAxisId="hum" orientation="right" stroke="#6b7280" fontSize={11} tickLine={false}
              label={{ value: '%', position: 'insideTopRight', offset: 10, style: { fill: '#6b7280', fontSize: 11 } }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#3380ff" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: '#3380ff' }} animationDuration={500} />
            <Line yAxisId="hum" type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: '#10b981' }} animationDuration={500} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
