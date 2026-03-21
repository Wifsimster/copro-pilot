import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useCoproprietes } from '@/hooks/useCoproprietes'
import { useCashFlowForecast } from '@/hooks/useCashFlow'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CircleCheck,
  Clock,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function formatEuro(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function StatCardSkeleton() {
  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card className="py-0">
      <div className="border-b p-4">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            </div>
            <div className="ml-3">
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function CashFlowPage() {
  const selectedCoproprieteId = useCoproprieteStore(
    s => s.selectedCoproprieteId
  )
  const { data: coproprietes } = useCoproprietes()
  const { data: forecast, isLoading } =
    useCashFlowForecast(selectedCoproprieteId)

  const selectedCopropriete = coproprietes?.find(
    c => c.id === selectedCoproprieteId
  )

  // Guard: requires copropriete selection
  if (!selectedCoproprieteId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Selectionnez une copropriete
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Veuillez selectionner une copropriete pour
          afficher les previsions de tresorerie.
        </p>
      </div>
    )
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <div className="h-8 w-72 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton />
      </div>
    )
  }

  // Empty state
  if (!forecast) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Previsions de tresorerie
          </h1>
          {selectedCopropriete && (
            <p className="text-sm text-muted-foreground">
              {selectedCopropriete.nom}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <TrendingUp className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            Aucune donnee de tresorerie disponible
            pour cette copropriete.
          </p>
        </div>
      </div>
    )
  }

  const tauxColor =
    forecast.taux_recouvrement >= 80
      ? 'bg-green-500'
      : 'bg-yellow-500'
  const tauxTextColor =
    forecast.taux_recouvrement >= 80
      ? 'text-green-700 dark:text-green-400'
      : 'text-yellow-700 dark:text-yellow-400'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Previsions de tresorerie
        </h1>
        {selectedCopropriete && (
          <p className="text-sm text-muted-foreground">
            {selectedCopropriete.nom}
          </p>
        )}
      </div>

      {/* 4 metric cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Total du */}
        <Card className="py-0">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                Total du
              </p>
              <p className="text-xl font-bold text-foreground">
                {formatEuro(forecast.total_du)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total paye */}
        <Card className="py-0">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500 text-white">
              <CircleCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                Total paye
              </p>
              <p className="text-xl font-bold text-foreground">
                {formatEuro(forecast.total_paye)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Taux de recouvrement */}
        <Card className="py-0">
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white',
                tauxColor
              )}
            >
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                Taux de recouvrement
              </p>
              <p
                className={cn(
                  'text-xl font-bold',
                  tauxTextColor
                )}
              >
                {forecast.taux_recouvrement}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Solde impaye */}
        <Card className="py-0">
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white',
                forecast.solde_impaye > 0
                  ? 'bg-red-500'
                  : 'bg-gray-400'
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                Solde impaye
              </p>
              <p
                className={cn(
                  'text-xl font-bold',
                  forecast.solde_impaye > 0
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-foreground'
                )}
              >
                {formatEuro(forecast.solde_impaye)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projections section */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Projections de paiements
        </h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* 30 jours */}
          <Card className="py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  Projection 30 jours
                </p>
                <p className="text-xl font-bold text-foreground">
                  {formatEuro(
                    forecast.projections.j30
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 60 jours */}
          <Card className="py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  Projection 60 jours
                </p>
                <p className="text-xl font-bold text-foreground">
                  {formatEuro(
                    forecast.projections.j60
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 90 jours */}
          <Card className="py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  Projection 90 jours
                </p>
                <p className="text-xl font-bold text-foreground">
                  {formatEuro(
                    forecast.projections.j90
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* At-risk coproprietaires section */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Coproprietaires a risque
        </h2>
        {forecast.coproprietaires_a_risque.length ===
        0 ? (
          <Card className="py-0">
            <CardContent className="flex flex-col items-center py-8">
              <CircleCheck className="h-8 w-8 text-green-500/60" />
              <p className="mt-2 text-sm text-muted-foreground">
                Aucun coproprietaire a risque identifie
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Coproprietaire
                  </TableHead>
                  <TableHead className="text-right">
                    Taux de recouvrement
                  </TableHead>
                  <TableHead className="text-right">
                    Montant impaye
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecast.coproprietaires_a_risque.map(
                  copro => (
                    <TableRow
                      key={copro.coproprietaire_id}
                    >
                      <TableCell className="font-medium">
                        {copro.nom} {copro.prenom}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            copro.taux_recouvrement <
                              50
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          )}
                        >
                          {copro.taux_recouvrement}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-700 dark:text-red-400">
                        {formatEuro(
                          copro.montant_impaye
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}
