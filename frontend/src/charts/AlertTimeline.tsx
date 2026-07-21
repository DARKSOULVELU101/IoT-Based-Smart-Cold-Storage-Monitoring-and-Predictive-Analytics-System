import { useMemo } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts'
import { format } from 'date-fns'
import type { Alert } from '../services/api'

interface Props {
  alerts: Alert[]
  title?: string
}

const severityValues: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }
const severityColors: Record<string, string> = { LOW: '#3b82f6', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' }

export default function AlertTimeline({ alerts, title = 'Alert Timeline' }: Props) {
  const chartData = useMemo(() =>
    alerts.map((alert, index) => ({
      time: new Date(alert.createdAt).getTime(),
      severity: severityValues[alert.severity] || 1,
      value: 1,
      name: alert.type,
      message: alert.message,
      severityLabel: alert.severity,
      index,
    }))
  , [alerts])

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" dataKey="time" stroke="#6b7280" fontSize={11} tickLine={false}
              tickFormatter={(v) => format(new Date(v), 'HH:mm')} />
            <YAxis type="number" dataKey="severity" stroke="#6b7280" fontSize={11} tickLine={false}
              domain={[0, 5]} ticks={[1, 2, 3, 4]}
              tickFormatter={(v) => ({ 1: 'LOW', 2: 'MED', 3: 'HIGH', 4: 'CRIT' }[v] || '')} />
            <ZAxis type="number" dataKey="value" range={[60, 200]} />
            <Tooltip />
            {Object.entries(severityColors).map(([severity, color]) => (
              <Scatter key={severity} name={severity}
                data={chartData.filter((d) => d.severityLabel === severity)}
                fill={color} opacity={0.8} animationDuration={500} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
