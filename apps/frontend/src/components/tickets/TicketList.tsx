import type { Ticket } from '@/types'
import { MessageSquare, Plus, Trash2, Pencil } from 'lucide-react'
import {
  CATEGORIE_LABELS,
  CATEGORIE_COLORS,
  STATUT_LABELS,
  STATUT_COLORS,
  PRIORITE_LABELS,
  PRIORITE_COLORS,
} from './constants'

export function TicketList({
  tickets,
  isLoading,
  onNew,
  onSelect,
  onEdit,
  onDelete,
}: {
  tickets: Ticket[] | undefined
  isLoading: boolean
  onNew: () => void
  onSelect: (id: number) => void
  onEdit: (ticket: Ticket) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Tickets</h2>
        <button type="button"
          onClick={onNew}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Nouveau ticket
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        </div>
      ) : !tickets || tickets.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <MessageSquare className="size-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun ticket</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Sujet</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Auteur</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Categorie</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Priorite</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Messages</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket: Ticket) => (
                <tr
                  key={ticket.id}
                  className="cursor-pointer border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30"
                  onClick={() => onSelect(ticket.id)}
                >
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                    {ticket.sujet}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {ticket.auteur_nom ?? 'Inconnu'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORIE_COLORS[ticket.categorie]}`}>
                      {CATEGORIE_LABELS[ticket.categorie]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITE_COLORS[ticket.priorite]}`}>
                      {PRIORITE_LABELS[ticket.priorite]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[ticket.statut]}`}>
                      {STATUT_LABELS[ticket.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3.5" />
                      {ticket.messages_count ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                    {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button type="button"
                        onClick={() => onEdit(ticket)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-700"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(ticket.id)}
                        className="rounded p-1 text-stone-400 hover:text-red-600"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
