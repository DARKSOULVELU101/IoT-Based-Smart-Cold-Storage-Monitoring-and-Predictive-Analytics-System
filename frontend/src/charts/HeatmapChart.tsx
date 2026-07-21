import { useMemo } from 'react'
import clsx from 'clsx'
import type { Reading } from '../services/api'

interface Props {
  readings: Reading[]
  title?: string
  metric?: 'temperature' | 'humidity'
}

function getHeatColor(value: number, min: number, max: number): string {
  const n = (value - min) / (max - min || 1)
  if (n < 0.25) return 'bg-cold-500/80'
  if (n < 0.5) return 'bg-emerald-500/80'
  if (n < 0.75) return 'bg-amber-500/80'
  return 'bg-red-500/80'
}

function getHeatTextColor(value: number, min: number, max: number): string {
  const n = (value - min) / (max - min || 1)
  if (n < 0.25) return 'text-cold-100'
  if (n < 0.5) return 'text-emerald-100'
  if (n < 0.75) return 'text-amber-100'
  return 'text-red-100'
}

export default function HeatmapChart({ readings, title = 'Temperature Heatmap', metric = 'temperature' }: Props) {
  const { gridData, min, max, labels } = useMemo(() => {
    const values = readings.map((r) => r[metric])
    const minVal = Math.min(...values)
    const maxVal = Math.max(...values)
    const gridSize = Math.ceil(Math.sqrt(readings.length))
    const grid: { value: number; deviceId: string; label: string }[][] = []
    for (let i = 0; i < gridSize; i++) {
      const row: { value: number; deviceId: string; label: string }[] = []
      for (let j = 0; j < gridSize; j++) {
        const idx = i * gridSize + j
        if (idx < readings.length) {
          row.push({
            value: readings[idx][metric],
            deviceId: readings[idx].deviceId,
            label: `${readings[idx][metric].toFixed(1)}${metric === 'temperature' ? '°' : '%'}`,
          })
        } else {
          row.push({ value: 0, deviceId: '', label: '' })
        }
      }
      grid.push(row)
    }
    return { gridData: grid, min: minVal, max: maxVal, labels: { min: `${minVal.toFixed(1)}`, max: `${maxVal.toFixed(1)}` } }
  }, [readings, metric])

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{labels.min}</span>
          <div className="flex gap-0.5">
            <div className="w-4 h-3 rounded-sm bg-cold-500/80" />
            <div className="w-4 h-3 rounded-sm bg-emerald-500/80" />
            <div className="w-4 h-3 rounded-sm bg-amber-500/80" />
            <div className="w-4 h-3 rounded-sm bg-red-500/80" />
          </div>
          <span>{labels.max}</span>
        </div>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridData[0]?.length || 1}, minmax(0, 1fr))` }}>
        {gridData.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={clsx(
                'aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all duration-200 hover:scale-110 hover:z-10 cursor-default',
                cell.deviceId ? `${getHeatColor(cell.value, min, max)} ${getHeatTextColor(cell.value, min, max)}` : 'bg-gray-800/30'
              )}
              title={cell.deviceId ? `${cell.deviceId}: ${cell.label}` : ''}
            >
              {cell.deviceId && cell.label}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
