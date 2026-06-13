// react-doctor-disable-next-line react-doctor/prefer-dynamic-import -- already lazy-loaded by its only consumer (DashboardPage)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import {
  type NameType,
  type ValueType,
} from 'recharts/types/component/DefaultTooltipContent'
import { Card, CardContent } from '@/components/ui/card'

interface ImpayesChartProps {
  data: Array<{ mois: string; impayes: number }>
}

const eurFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function formatEur(value: number): string {
  return eurFormatter.format(value)
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-emerald-600">
        {formatEur(payload[0].value as number)}
      </p>
    </div>
  )
}

export default function ImpayesChart({ data }: ImpayesChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="py-0">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">
            Evolution des impayes
          </h2>
        </div>
        <CardContent className="flex h-52 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Aucune donnee disponible
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-foreground">
          Evolution des impayes
        </h2>
        <p className="text-xs text-muted-foreground">6 derniers mois</p>
      </div>
      <CardContent className="pt-4 pb-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
          >
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={v => formatEur(v)}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="impayes"
              fill="#059669"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
