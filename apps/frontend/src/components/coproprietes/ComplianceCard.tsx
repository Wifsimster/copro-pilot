import { useCompliance } from '@/hooks/useCompliance'
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react'

interface ComplianceCardProps {
  coproprieteId: number
}

// Keyed by the backend compliance contract (LoiAlurComplianceService emits
// `pass` / `fail`). `warning` is kept as a tolerated extra state. Lookups fall
// back to FALLBACK_STATUS so an unexpected status can never crash the card.
const STATUS_CONFIG = {
  pass: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  fail: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
} as const

const FALLBACK_STATUS = STATUS_CONFIG.warning

export function ComplianceCard({ coproprieteId }: ComplianceCardProps) {
  const { data: report, isLoading } = useCompliance(coproprieteId)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="size-5 text-stone-400" />
          <h3 className="text-base font-semibold text-stone-900 dark:text-white">
            Conformite Loi ALUR
          </h3>
        </div>
        <div className="flex justify-center py-4">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!report) return null

  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-base font-semibold text-stone-900 dark:text-white">
            Conformite Loi ALUR
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            report.compliant
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {report.compliant ? (
            <>
              <CheckCircle className="size-3.5" />
              Conforme
            </>
          ) : (
            <>
              <XCircle className="size-3.5" />
              Non conforme
            </>
          )}
        </span>
      </div>
      <div className="divide-y divide-stone-100 dark:divide-stone-700/50">
        {report.checks.map(check => {
          const config = STATUS_CONFIG[check.status] ?? FALLBACK_STATUS
          const Icon = config.icon
          return (
            <div
              key={check.name}
              className={`flex items-start gap-3 px-5 py-3 ${config.bg}`}
            >
              <Icon className={`mt-0.5 size-4 shrink-0 ${config.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-900 dark:text-white">
                  {check.name}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {check.details}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
