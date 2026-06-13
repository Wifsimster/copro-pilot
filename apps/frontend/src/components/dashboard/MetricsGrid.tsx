import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import {
  AlertTriangle,
  Calendar,
  Building2,
  FileText,
  Receipt,
  Gavel,
  AlertOctagon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatEuro } from './format'

const METRIC_CONFIG = [
  {
    key: 'coproprietes' as const,
    label: 'Coproprietes',
    icon: Building2,
    color: 'bg-emerald-500',
    link: '/coproprietes',
  },
  {
    key: 'incidents_ouverts' as const,
    label: 'Incidents ouverts',
    icon: AlertTriangle,
    color: 'bg-orange-500',
    link: '/travaux',
    badgeKey: 'incidents_critiques' as const,
    badgeLabel: 'critiques',
  },
  {
    key: 'impayes' as const,
    label: 'Impayes',
    icon: Receipt,
    color: 'bg-amber-500',
    link: '/charges',
    format: 'euro' as const,
  },
  {
    key: 'prochaines_ag' as const,
    label: 'Prochaines AG',
    icon: Calendar,
    color: 'bg-purple-500',
    link: '/assemblees',
  },
  {
    key: 'contrats_expirant' as const,
    label: 'Contrats a renouveler',
    icon: FileText,
    color: 'bg-cyan-500',
    link: '/contrats',
  },
  {
    key: 'procedures_actives' as const,
    label: 'Procedures actives',
    icon: Gavel,
    color: 'bg-rose-500',
    link: '/contentieux',
  },
  {
    key: 'sinistres_ouverts' as const,
    label: 'Sinistres ouverts',
    icon: AlertOctagon,
    color: 'bg-red-500',
    link: '/assurances',
  },
]

export default function MetricsGrid({
  metrics,
  delay = 0,
}: {
  metrics: Record<string, number>
  delay?: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {METRIC_CONFIG.map((cfg, i) => {
        const value = metrics[cfg.key] ?? 0
        const displayValue = cfg.format === 'euro' ? formatEuro(value) : value
        const badgeValue =
          'badgeKey' in cfg ? metrics[cfg.badgeKey as string] : undefined
        return (
          <m.div
            key={cfg.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: delay + i * 0.04,
            }}
          >
            <Link to={cfg.link} className="block">
              <Card className="py-0 transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${cfg.color} text-white`}
                  >
                    <cfg.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      {cfg.label}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xl font-bold text-foreground">
                        {displayValue}
                      </p>
                      {badgeValue != null && badgeValue > 0 && (
                        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {badgeValue}{' '}
                          {'badgeLabel' in cfg ? cfg.badgeLabel : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </m.div>
        )
      })}
    </div>
  )
}
