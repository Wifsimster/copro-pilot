import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import {
  type NameType,
  type ValueType,
} from 'recharts/types/component/DefaultTooltipContent'
import { Card, CardContent } from '@/components/ui/card'

interface IncidentsChartProps {
  data: Record<string, number>
}

const STATUS_COLORS: Record<string, string> = {
  ouvert: '#ef4444',
  en_cours: '#f59e0b',
  resolu: '#059669',
  ferme: '#78716c',
}

const STATUS_LABELS: Record<string, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  resolu: 'Resolu',
  ferme: 'Ferme',
}

function CustomTooltip({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-foreground">
        {entry.name}
      </p>
      <p style={{ color: entry.payload?.fill }}>
        {entry.value} incident{Number(entry.value) > 1 ? 's' : ''}
      </p>
    </div>
  )
}

export default function IncidentsChart({
  data,
}: IncidentsChartProps) {
  const chartData = useMemo(() => {
    if (!data) return []
    return Object.entries(data).flatMap(([statut, count]) =>
      count > 0
        ? [
            {
              name: STATUS_LABELS[statut] || statut,
              value: count,
              fill: STATUS_COLORS[statut] || '#a8a29e',
            },
          ]
        : []
    )
  }, [data])

  if (chartData.length === 0) {
    return (
      <Card className="py-0">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">
            Incidents par statut
          </h2>
        </div>
        <CardContent className="flex h-52 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Aucun incident
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-foreground">
          Incidents par statut
        </h2>
      </div>
      <CardContent className="pt-4 pb-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconSize={10}
              iconType="circle"
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
