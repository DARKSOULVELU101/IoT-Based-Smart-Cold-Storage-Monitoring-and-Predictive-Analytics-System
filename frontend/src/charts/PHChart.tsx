import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'

interface PHData {
  timestamp: string
  ph: number
  deviceId?: string
}

interface Props {
  data: PHData[]
  title?: string
}

export default function PHChart({ data, title = 'pH Monitoring' }: Props) {
  const chartData = useMemo(() =>
    data.map((d) => ({
      time: format(new Date(d.timestamp), 'HH:mm'),
      ph: d.ph,
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
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={[0, 14]}
              label={{ value: 'pH', position: 'insideTopLeft', offset: 10, style: { fill: '#6b7280', fontSize: 11 } }} />
            <Tooltip />
            <ReferenceLine y={6.5} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} label="" />
            <ReferenceLine y={8.5} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} label="" />
            <ReferenceLine y={7} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.3} />
            <Line type="monotone" dataKey="ph" stroke="#22d3ee" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: '#22d3ee' }} animationDuration={500} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-water-400" /><span>pH Level</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /><span>Acceptable Range</span></div>
      </div>
    </div>
  )
}
