import { useMemo } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { ZoneAnalytics } from '../services/api'

interface Props {
  zones: ZoneAnalytics[]
  title?: string
}

export default function ZoneComparisonChart({ zones, title = 'Zone Comparison' }: Props) {
  const chartData = useMemo(() => {
    if (!zones.length) return []
    return [
      { metric: 'Temperature', ...Object.fromEntries(zones.map((z) => [z.zone, Math.min(z.avgTemperature * 10, 100)])) },
      { metric: 'Humidity', ...Object.fromEntries(zones.map((z) => [z.zone, z.avgHumidity])) },
      { metric: 'Risk Score', ...Object.fromEntries(zones.map((z) => [z.zone, z.avgRiskScore])) },
      { metric: 'Online %', ...Object.fromEntries(zones.map((z) => [z.zone, (z.onlineCount / Math.max(z.deviceCount, 1)) * 100])) },
    ]
  }, [zones])

  const zoneColors = ['#3380ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="metric" stroke="#6b7280" fontSize={11} />
            <PolarRadiusAxis stroke="#374151" fontSize={10} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            {zones.map((zone, i) => (
              <Radar key={zone.zone} name={zone.zone} dataKey={zone.zone}
                stroke={zoneColors[i % zoneColors.length]} fill={zoneColors[i % zoneColors.length]}
                fillOpacity={0.1} strokeWidth={2} animationDuration={500} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
