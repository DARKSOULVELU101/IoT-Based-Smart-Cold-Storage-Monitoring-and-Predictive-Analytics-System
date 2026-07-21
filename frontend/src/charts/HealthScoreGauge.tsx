import ScoreGauge from '../components/ScoreGauge'

interface Props {
  score: number
  label?: string
  subtitle?: string
}

export default function HealthScoreGauge({ score, label = 'Health Score', subtitle }: Props) {
  return (
    <div className="glass-card p-6 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{label}</h3>
      <ScoreGauge score={score} size="lg" />
      {subtitle && <p className="text-xs text-gray-500 mt-3 text-center">{subtitle}</p>}
    </div>
  )
}
