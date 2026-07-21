import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface TDSData {
  timestamp: string
  tds: number
  deviceId?: string
}

interface Props {
  data: TDSData[]
  title?: string
}

export default function TDSChart({ data, title = 'TDS Levels' }: Props) {
  const chartData = useMemo(() =>
    data.map((d) => ({
      time: format(new Date(d.timestamp), 'HH:mm'),
      tds: d.tds,
    })).reverse()
  , [data])

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="tdsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false}
              label={{ value: 'ppm', position: 'insideTopLeft', offset: 10, style: { fill: '#6b7280', fontSize: 11 } }} />
            <Tooltip />
            <Area type="monotone" dataKey="tds" stroke="#06b6d4" strokeWidth={2} fill="url(#tdsGradient)" animationDuration={500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
