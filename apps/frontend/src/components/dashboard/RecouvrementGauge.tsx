import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface RecouvrementGaugeProps {
  value: number
}

function getColor(pct: number): {
  ring: string
  text: string
  track: string
} {
  if (pct >= 80) {
    return {
      ring: 'stroke-emerald-500',
      text: 'text-emerald-600',
      track: 'stroke-emerald-100 dark:stroke-emerald-900/30',
    }
  }
  if (pct >= 50) {
    return {
      ring: 'stroke-amber-500',
      text: 'text-amber-600',
      track: 'stroke-amber-100 dark:stroke-amber-900/30',
    }
  }
  return {
    ring: 'stroke-red-500',
    text: 'text-red-600',
    track: 'stroke-red-100 dark:stroke-red-900/30',
  }
}

export default function RecouvrementGauge({ value }: RecouvrementGaugeProps) {
  const pct = Math.min(100, Math.max(0, value))
  const colors = useMemo(() => getColor(pct), [pct])

  // SVG circular progress
  const size = 120
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <Card className="py-0">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-foreground">
          Taux de recouvrement
        </h2>
      </div>
      <CardContent className="flex flex-col items-center justify-center pt-4 pb-4">
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              className={colors.track}
            />
            {/* Progress ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`${colors.ring} transition-[stroke-dashoffset] duration-700 ease-out`}
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${colors.text}`}>
              {pct.toFixed(0)}%
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {pct >= 80
            ? 'Bon niveau de recouvrement'
            : pct >= 50
              ? 'Recouvrement a surveiller'
              : 'Recouvrement insuffisant'}
        </p>
      </CardContent>
    </Card>
  )
}
