import { useState } from 'react'
import { toast } from 'sonner'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useComptesBancairesByCopropriete } from '@/hooks/useComptesBancaires'
import {
  useSuggestedMatches,
  useConfirmMatch,
} from '@/hooks/useReconciliation'
import type { CompteBancaire, SuggestedMatch } from '@/types'
import {
  ArrowLeftRight,
  ChevronDown,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

const CONFIDENCE_COLORS: Record<string, string> = {
  haute:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  moyenne:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  faible:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const CONFIDENCE_LABELS: Record<string, string> = {
  haute: 'Haute',
  moyenne: 'Moyenne',
  faible: 'Faible',
}

export default function ReconciliationPage() {
  const selectedCoproId = useCoproprieteStore(
    s => s.selectedCoproprieteId
  )
  const [selectedCompteId, setSelectedCompteId] =
    useState<number | undefined>()

  const { data: comptes } =
    useComptesBancairesByCopropriete(selectedCoproId)
  const {
    data: suggestions,
    isLoading: loadingSuggestions,
  } = useSuggestedMatches(selectedCompteId)
  const confirmMatch = useConfirmMatch()

  const handleConfirm = async (match: SuggestedMatch) => {
    try {
      await confirmMatch.mutateAsync({
        mouvementId: match.mouvement_id,
        appelFondsId: match.appel_fonds_id,
      })
      toast.success('Rapprochement confirme avec succes')
    } catch {
      toast.error(
        'Erreur lors de la confirmation du rapprochement'
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reconciliation bancaire
        </h1>
        <p className="text-gray-500 dark:text-zinc-400">
          Rapprochement automatique entre mouvements
          bancaires et appels de fonds
        </p>
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 dark:border-zinc-600">
          <ArrowLeftRight className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Aucune copropriete selectionnee
          </h3>
          <p className="mt-2 text-gray-500 dark:text-zinc-400">
            Selectionnez une copropriete dans le menu
            lateral.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Suggestions de rapprochement
            </h2>
            <div className="relative">
              <select
                value={selectedCompteId || ''}
                onChange={e =>
                  setSelectedCompteId(
                    e.target.value
                      ? parseInt(e.target.value)
                      : undefined
                  )
                }
                className="appearance-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              >
                <option value="">
                  Selectionner un compte...
                </option>
                {comptes?.map((c: CompteBancaire) => (
                  <option key={c.id} value={c.id}>
                    {c.banque} ({c.iban?.slice(-4)})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {!selectedCompteId ? (
            <div className="flex flex-col items-center py-12">
              <ArrowLeftRight className="h-10 w-10 text-gray-300 dark:text-zinc-600" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">
                Selectionnez un compte bancaire pour voir
                les suggestions
              </p>
            </div>
          ) : loadingSuggestions ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : !suggestions || suggestions.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <CheckCircle className="h-10 w-10 text-green-300 dark:text-green-800" />
              <p className="mt-3 text-gray-500 dark:text-zinc-400">
                Aucune suggestion de rapprochement
              </p>
              <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">
                Tous les mouvements sont rapproches ou
                aucune correspondance trouvee.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-zinc-700">
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                      Mouvement
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                      Montant mouv.
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                      Date mouv.
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400" />
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                      Appel de fonds
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                      Montant appel
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                      Date appel
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                      Confiance
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">
                      Score
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400" />
                  </tr>
                </thead>
                <tbody>
                  {suggestions.map(
                    (
                      match: SuggestedMatch,
                      idx: number
                    ) => (
                      <tr
                        key={`${match.mouvement_id}-${match.appel_fonds_id}-${idx}`}
                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-zinc-700/50 dark:hover:bg-zinc-700/30"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {match.mouvement_libelle}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {match.mouvement_montant.toLocaleString(
                            'fr-FR',
                            {
                              style: 'currency',
                              currency: 'EUR',
                            }
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                          {new Date(
                            match.mouvement_date
                          ).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {match.appel_fonds_reference}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {match.appel_fonds_montant.toLocaleString(
                            'fr-FR',
                            {
                              style: 'currency',
                              currency: 'EUR',
                            }
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                          {new Date(
                            match.appel_fonds_date
                          ).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CONFIDENCE_COLORS[match.confidence]}`}
                          >
                            {
                              CONFIDENCE_LABELS[
                                match.confidence
                              ]
                            }
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">
                          {match.score}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              handleConfirm(match)
                            }
                            disabled={
                              confirmMatch.isPending
                            }
                            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Confirmer
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
