import { useMemo, useState } from 'react'
import {
  Calculator,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLotsByCopropriete } from '@/hooks/useLots'
import { useAppelsFondsByCopropriete } from '@/hooks/useAppelsFonds'
import { computeRegularisation } from '@/lib/regularisationCharges'

interface RegularisationTabProps {
  coproprieteId: number
}

function eur(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

const STEPS = ['Exercice', 'Charges réelles', 'Provisions', 'Régularisation']

export function RegularisationTab({ coproprieteId }: RegularisationTabProps) {
  const { data: lots, isLoading: loadingLots } =
    useLotsByCopropriete(coproprieteId)
  const { data: appels } = useAppelsFondsByCopropriete(coproprieteId)

  const now = new Date()
  const [step, setStep] = useState(0)
  const [annee, setAnnee] = useState(now.getFullYear() - 1)
  const [chargesReelles, setChargesReelles] = useState('')
  const [provisions, setProvisions] = useState('')

  // Provisions prefill = sum of the year's appels de fonds.
  const provisionsFromAppels = useMemo(
    () =>
      (appels || [])
        .filter(a => a.annee === annee)
        .reduce((s, a) => s + Number(a.montant_total || 0), 0),
    [appels, annee]
  )

  const regLots = useMemo(
    () =>
      (lots || []).map(l => ({
        id: l.id,
        numero: l.numero,
        tantiemes: Number(l.tantiemes || 0),
      })),
    [lots]
  )

  const result = useMemo(() => {
    if (step < 3) return null
    try {
      return computeRegularisation(
        regLots,
        parseFloat(chargesReelles) || 0,
        parseFloat(provisions) || 0
      )
    } catch {
      return null
    }
  }, [step, regLots, chargesReelles, provisions])

  const inputCls =
    'mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  const canProceed =
    (step === 0 && annee >= 2000 && regLots.length > 0) ||
    (step === 1 && parseFloat(chargesReelles) > 0) ||
    (step === 2 && parseFloat(provisions) >= 0) ||
    step === 3

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="size-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
          Régularisation des charges — assistant de clôture
        </h2>
      </div>

      {loadingLots ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : regLots.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Aucun lot n'est enregistré pour cette copropriété — ajoutez les lots
          et leurs tantièmes avant de régulariser.
        </p>
      ) : (
        <>
          {/* progress */}
          <div className="mb-4 flex gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1.5 rounded-full ${
                    i <= step ? 'bg-emerald-500' : 'bg-muted'
                  }`}
                />
                <span className="mt-1 block text-center text-[11px] text-muted-foreground">
                  {s}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4 py-2">
            {step === 0 && (
              <label className="block max-w-xs">
                <span className="text-sm font-medium">Exercice à clôturer</span>
                <input
                  type="number"
                  className={inputCls}
                  value={annee}
                  onChange={e => setAnnee(Number(e.target.value))}
                />
                <span className="mt-1 block text-xs text-muted-foreground">
                  {regLots.length} lots, {regLots.reduce((s, l) => s + l.tantiemes, 0)}{' '}
                  tantièmes au total.
                </span>
              </label>
            )}

            {step === 1 && (
              <label className="block max-w-xs">
                <span className="text-sm font-medium">
                  Total des charges réelles de l'exercice (€)
                </span>
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  value={chargesReelles}
                  onChange={e => setChargesReelles(e.target.value)}
                  placeholder="18500"
                />
                <span className="mt-1 block text-xs text-muted-foreground">
                  Montant total des dépenses réelles de l'exercice clos (charges
                  générales réparties aux tantièmes).
                </span>
              </label>
            )}

            {step === 2 && (
              <label className="block max-w-xs">
                <span className="text-sm font-medium">
                  Total des provisions appelées (€)
                </span>
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  value={provisions}
                  onChange={e => setProvisions(e.target.value)}
                  placeholder="20000"
                />
                {provisionsFromAppels > 0 && (
                  <button
                    type="button"
                    className="mt-2 text-xs font-medium text-emerald-600 hover:underline"
                    onClick={() =>
                      setProvisions(String(provisionsFromAppels))
                    }
                  >
                    Reprendre les appels {annee} :{' '}
                    {eur(provisionsFromAppels)}
                  </button>
                )}
              </label>
            )}

            {step === 3 && result && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-lg bg-muted px-4 py-2 text-sm">
                    <span className="text-muted-foreground">Solde global : </span>
                    <span className="font-semibold">
                      {eur(result.soldeGlobal)}
                    </span>{' '}
                    {result.soldeGlobal >= 0 ? '(excédent)' : '(insuffisance)'}
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <TrendingUp className="size-4" /> À rembourser :{' '}
                    {eur(result.totalRemboursements)}
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    <TrendingDown className="size-4" /> À appeler :{' '}
                    {eur(result.totalComplements)}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-4">Lot</th>
                        <th className="py-2 pr-4 text-right">Tantièmes</th>
                        <th className="py-2 pr-4 text-right">Quote-part</th>
                        <th className="py-2 pr-4 text-right">Provisions</th>
                        <th className="py-2 pr-4 text-right">Solde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.lignes.map(l => (
                        <tr key={l.lotId} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium">{l.numero}</td>
                          <td className="py-2 pr-4 text-right">
                            {l.tantiemes}
                          </td>
                          <td className="py-2 pr-4 text-right">
                            {eur(l.quotePart)}
                          </td>
                          <td className="py-2 pr-4 text-right">
                            {eur(l.provisions)}
                          </td>
                          <td
                            className={`py-2 pr-4 text-right font-medium ${
                              l.sens === 'crediteur'
                                ? 'text-emerald-600'
                                : l.sens === 'debiteur'
                                  ? 'text-amber-600'
                                  : ''
                            }`}
                          >
                            {eur(l.solde)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-xs text-muted-foreground dark:bg-stone-900/40">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  Répartition aux tantièmes, exacte au centime. Un solde
                  créditeur est à rembourser au copropriétaire, un solde
                  débiteur donne lieu à un appel complémentaire. Faites
                  approuver les comptes de l'exercice en AG avant régularisation.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(s => s - 1)}
              >
                <ArrowLeft className="size-4" /> Retour
              </Button>
            )}
            {step < 3 && (
              <Button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed}
              >
                Continuer <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
