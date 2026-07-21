import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface VibrationData {
  timestamp: string
  vibrationX: number
  vibrationY: number
  vibrationZ: number
  deviceId?: string
}

interface Props {
  data: VibrationData[]
  title?: string
}

export default function VibrationChart({ data, title = 'Vibration Analysis' }: Props) {
  const chartData = useMemo(() =>
    data.map((d) => ({
      time: format(new Date(d.timestamp), 'HH:mm'),
      'X-Axis': d.vibrationX,
      'Y-Axis': d.vibrationY,
      'Z-Axis': d.vibrationZ,
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
              label={{ value: 'mm/s', position: 'insideTopLeft', offset: 10, style: { fill: '#6b7280', fontSize: 11 } }} />
            <Tooltip />
            <Line type="monotone" dataKey="X-Axis" stroke="#e879f9" strokeWidth={2} dot={false} animationDuration={500} />
            <Line type="monotone" dataKey="Y-Axis" stroke="#c026d3" strokeWidth={2} dot={false} animationDuration={500} />
            <Line type="monotone" dataKey="Z-Axis" stroke="#a21caf" strokeWidth={2} dot={false} animationDuration={500} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-machine-400" /><span>X-Axis</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-machine-600" /><span>Y-Axis</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-machine-700" /><span>Z-Axis</span></div>
      </div>
    </div>
  )
}
