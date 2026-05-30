import type { Ticket, TicketMessage } from '@/types'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Trash2,
  Pencil,
  ArrowLeft,
  Send,
  Clock,
} from 'lucide-react'
import {
  CATEGORIE_LABELS,
  CATEGORIE_COLORS,
  STATUT_LABELS,
  STATUT_COLORS,
  PRIORITE_LABELS,
  PRIORITE_COLORS,
} from './constants'

export function TicketDetailPanel({
  selectedTicket,
  loadingDetail,
  currentUserId,
  newMessage,
  isSending,
  scrollAnchorRef,
  onBack,
  onEdit,
  onDelete,
  onNewMessageChange,
  onKeyDown,
  onSendMessage,
}: {
  selectedTicket: (Ticket & { messages?: TicketMessage[] }) | undefined
  loadingDetail: boolean
  currentUserId: string | undefined
  newMessage: string
  isSending: boolean
  scrollAnchorRef: (node: HTMLDivElement | null) => void
  onBack: () => void
  onEdit: (ticket: Ticket) => void
  onDelete: (id: number) => void
  onNewMessageChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSendMessage: () => void
}) {
  return (
    <>
      <div className="flex items-center gap-3">
        <button type="button"
          onClick={onBack}
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          aria-label="Retour"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
            {selectedTicket?.sujet ?? 'Chargement...'}
          </h1>
          {selectedTicket && (
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[selectedTicket.statut]}`}>
                {STATUT_LABELS[selectedTicket.statut]}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORIE_COLORS[selectedTicket.categorie]}`}>
                {CATEGORIE_LABELS[selectedTicket.categorie]}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITE_COLORS[selectedTicket.priorite]}`}>
                {PRIORITE_LABELS[selectedTicket.priorite]}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                par {selectedTicket.auteur_nom ?? 'Inconnu'} le{' '}
                {new Date(selectedTicket.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
        </div>
        {selectedTicket && (
          <div className="flex gap-2">
            <button type="button"
              onClick={() => onEdit(selectedTicket)}
              className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              <Pencil className="size-4" />
              Modifier
            </button>
            <button type="button"
              onClick={() => onDelete(selectedTicket.id)}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="size-4" />
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Messages thread */}
      <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
        <div className="border-b border-stone-200 p-4 dark:border-stone-700">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Messages</h2>
        </div>

        {loadingDetail ? (
          <div className="flex justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="max-h-[500px] space-y-4 overflow-y-auto p-4">
              {(!selectedTicket?.messages || selectedTicket.messages.length === 0) ? (
                <div className="flex flex-col items-center py-8">
                  <MessageSquare className="size-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun message pour le moment</p>
                </div>
              ) : (
                selectedTicket.messages.map((msg: TicketMessage) => {
                  const isOwn = msg.auteur_id === currentUserId
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-3 ${
                          isOwn
                            ? 'bg-emerald-700 text-white'
                            : 'bg-stone-100 text-stone-900 dark:bg-stone-700 dark:text-white'
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2 text-xs opacity-75">
                          <span className="font-medium">{msg.auteur_nom ?? 'Inconnu'}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(msg.created_at).toLocaleString('fr-FR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{msg.contenu}</p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={scrollAnchorRef} />
            </div>

            {/* Message input */}
            <div className="border-t border-stone-200 p-4 dark:border-stone-700">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => onNewMessageChange(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ecrire un message..."
                  className="min-h-[44px] resize-none"
                  rows={1}
                />
                <Button
                  onClick={onSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="shrink-0"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
