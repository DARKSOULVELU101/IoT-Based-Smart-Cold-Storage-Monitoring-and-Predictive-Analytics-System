import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'

interface AQIData {
  timestamp: string
  aqi: number
  pm25?: number
  co2?: number
}

interface Props {
  data: AQIData[]
  title?: string
}

export default function AirQualityChart({ data, title = 'Air Quality Index' }: Props) {
  const chartData = useMemo(() =>
    data.map((d) => ({
      time: format(new Date(d.timestamp), 'HH:mm'),
      aqi: d.aqi,
      pm25: d.pm25,
    })).reverse()
  , [data])

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false}
              label={{ value: 'AQI', position: 'insideTopLeft', offset: 10, style: { fill: '#6b7280', fontSize: 11 } }} />
            <Tooltip />
            <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Line type="monotone" dataKey="aqi" stroke="#f97316" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: '#f97316' }} animationDuration={500} />
            {chartData[0]?.pm25 !== undefined && (
              <Line type="monotone" dataKey="pm25" stroke="#fb923c" strokeWidth={1.5} dot={false} strokeDasharray="5 5"
                animationDuration={500} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warehouse-500" /><span>AQI</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /><span>Caution (100)</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span>Unhealthy (200)</span></div>
      </div>
    </div>
  )
}
