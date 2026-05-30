import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Echeance {
  id: number
  date_echeance: string
  trimestre: number
  annee: number
  montant_total: number
  copropriete_nom?: string
}

interface EcheancesCardProps {
  echeances: Echeance[]
}

const eurFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function formatEur(value: number): string {
  return eurFormatter.format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr).getTime() < Date.now()
}

export default function EcheancesCard({
  echeances,
}: EcheancesCardProps) {
  const sorted = useMemo(
    () =>
      echeances
        .toSorted(
          (a, b) =>
            new Date(a.date_echeance).getTime() -
            new Date(b.date_echeance).getTime()
        )
        .slice(0, 5),
    [echeances]
  )

  if (sorted.length === 0) {
    return (
      <Card className="py-0">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">
            Prochaines echeances
          </h2>
        </div>
        <CardContent className="flex h-52 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Aucune echeance a venir
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold text-foreground">
          Prochaines echeances
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {sorted.length}
        </span>
      </div>
      <div className="divide-y divide-border">
        {sorted.map(e => {
          const overdue = isOverdue(e.date_echeance)
          return (
            <div
              key={e.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  overdue
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                }`}
              >
                <Calendar className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    overdue
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-foreground'
                  }`}
                >
                  T{e.trimestre} {e.annee}
                  {e.copropriete_nom
                    ? ` — ${e.copropriete_nom}`
                    : ''}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(e.date_echeance)}</span>
                  {overdue && (
                    <>
                      <span>&middot;</span>
                      <span className="font-medium text-red-500">
                        En retard
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 text-sm font-semibold ${
                  overdue
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-foreground'
                }`}
              >
                {formatEur(e.montant_total)}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
