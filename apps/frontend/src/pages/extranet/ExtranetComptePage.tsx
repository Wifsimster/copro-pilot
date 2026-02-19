import { useExtranetCompte } from '@/hooks/useExtranet'
import { formatEur, StatCard } from '@/components/extranet/shared'

export default function ExtranetComptePage() {
  const { data: compte, isLoading } = useExtranetCompte()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon compte</h1>
        <p className="text-muted-foreground">
          Etat de votre compte coproprietaire
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-32 rounded bg-muted" />
      ) : !compte ? (
        <p className="text-sm text-muted-foreground">
          Aucune donnee.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total appele"
              value={formatEur(compte.total_du)}
            />
            <StatCard
              label="Total paye"
              value={formatEur(compte.total_paye)}
            />
            <StatCard
              label="Solde"
              value={formatEur(Number(compte.solde))}
              color={
                Number(compte.solde) > 0
                  ? 'text-red-600'
                  : Number(compte.solde) < 0
                    ? 'text-green-600'
                    : undefined
              }
            />
          </div>
          {Number(compte.solde) > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
              Vous avez un solde debiteur de{' '}
              {formatEur(Number(compte.solde))}. Merci de
              regulariser votre situation.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
