import {
  Plus, Trash2, Pencil, FileSearch, CalendarDays, ChevronDown, ChevronRight,
} from 'lucide-react'
import type { DeclarationRegistre } from '@/types'
import { ExpandedDonnees } from '@/components/immatriculation/ExpandedDonnees'

const STATUT_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  valide: 'Valide',
}

const STATUT_COLORS: Record<string, string> = {
  brouillon: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  soumis: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  valide: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

interface DeclarationsTableProps {
  declarations: DeclarationRegistre[] | undefined
  isLoading: boolean
  isPreparating: boolean
  expandedRow: number | null
  onPreparer: () => void
  onNouvelle: () => void
  onToggleRow: (id: number) => void
  onEdit: (decl: DeclarationRegistre) => void
  onDelete: (id: number) => void
  children?: React.ReactNode
}

export function DeclarationsTable({
  declarations,
  isLoading,
  isPreparating,
  expandedRow,
  onPreparer,
  onNouvelle,
  onToggleRow,
  onEdit,
  onDelete,
  children,
}: DeclarationsTableProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Declarations annuelles</h2>
        <div className="flex gap-2">
          <button type="button"
            onClick={onPreparer}
            disabled={isPreparating}
            className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            <FileSearch className="size-4" />
            {isPreparating ? 'Preparation...' : 'Preparer declaration'}
          </button>
          <button type="button"
            onClick={onNouvelle}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
          >
            <Plus className="size-4" />
            Nouvelle declaration
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !declarations || declarations.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <CalendarDays className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucune declaration enregistree</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400 w-8" aria-label="Actions"></th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Annee</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date de declaration</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Notes</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {declarations.map((decl: DeclarationRegistre) => (
                <>
                  <tr
                    key={decl.id}
                    className="border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30 cursor-pointer"
                    onClick={() => onToggleRow(decl.id)}
                  >
                    <td className="px-4 py-3 text-stone-400">
                      {decl.donnees_declarees ? (
                        expandedRow === decl.id
                          ? <ChevronDown className="size-4" />
                          : <ChevronRight className="size-4" />
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">{decl.annee}</td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                      {decl.date_declaration
                        ? new Date(decl.date_declaration).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[decl.statut]}`}>
                        {STATUT_LABELS[decl.statut]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-300 max-w-xs truncate">
                      {decl.notes || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button type="button"
                          onClick={() => onEdit(decl)}
                          className="rounded p-1 text-stone-400 hover:text-emerald-700"
                          aria-label="Modifier"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button type="button"
                          onClick={() => onDelete(decl.id)}
                          className="rounded p-1 text-stone-400 hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === decl.id && decl.donnees_declarees && (
                    <tr key={`${decl.id}-detail`} className="border-b border-stone-100 dark:border-stone-700/50">
                      <td colSpan={6} className="px-4 py-3">
                        <ExpandedDonnees donnees={decl.donnees_declarees} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {children}
    </div>
  )
}
