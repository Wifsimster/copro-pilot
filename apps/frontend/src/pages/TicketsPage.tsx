import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useAuthStore } from '@/store/authStore'
import {
  useTicketsByCopropriete,
  useTicket,
  useCreateTicket,
  useUpdateTicket,
  useDeleteTicket,
  useAddTicketMessage,
} from '@/hooks/useTickets'
import { ErrorAlert } from '@/components/layout/ErrorAlert'
import { FormDialog } from '@/components/ui/form-dialog'
import type { Ticket } from '@/types'
import { MessageSquare } from 'lucide-react'
import { TicketList } from '@/components/tickets/TicketList'
import { TicketDetailPanel } from '@/components/tickets/TicketDetailPanel'
import { TicketCreateFields } from '@/components/tickets/TicketCreateFields'
import { TicketEditFields } from '@/components/tickets/TicketEditFields'
import {
  ticketSchema,
  updateTicketSchema,
  type TicketFormData,
  type UpdateTicketFormData,
} from '@/components/tickets/schemas'

export default function TicketsPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()
  const { user } = useAuthStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])

  const [ui, setUi] = useState<{
    showCreateDialog: boolean
    showEditDialog: boolean
    editingTicket: Ticket | null
    selectedTicketId: number | null
    newMessage: string
    deleteId: number | null
  }>({
    showCreateDialog: false,
    showEditDialog: false,
    editingTicket: null,
    selectedTicketId: null,
    newMessage: '',
    deleteId: null,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { showCreateDialog, showEditDialog, editingTicket, selectedTicketId, newMessage, deleteId } = ui


  const {
    data: tickets,
    isLoading,
    isError,
    error,
  } = useTicketsByCopropriete(selectedCoproId)
  const {
    data: selectedTicket,
    isLoading: loadingDetail,
  } = useTicket(selectedTicketId ?? undefined)

  const createTicket = useCreateTicket()
  const updateTicket = useUpdateTicket()
  const deleteTicket = useDeleteTicket()
  const addMessage = useAddTicketMessage()

  const createForm = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      sujet: '',
      categorie: 'general',
      priorite: 'normale',
    },
  })

  // Sync the edit form to the ticket being edited without an effect:
  // react-hook-form resets fields whenever `values` changes (deep compare).
  const editForm = useForm<UpdateTicketFormData>({
    resolver: zodResolver(updateTicketSchema),
    values: editingTicket
      ? {
          sujet: editingTicket.sujet,
          categorie:
            editingTicket.categorie as UpdateTicketFormData['categorie'],
          statut: editingTicket.statut as UpdateTicketFormData['statut'],
          priorite:
            editingTicket.priorite as UpdateTicketFormData['priorite'],
        }
      : {
          sujet: '',
          categorie: 'general',
          statut: 'ouvert',
          priorite: 'normale',
        },
  })

  // Callback ref on the scroll anchor: re-runs whenever the message count
  // changes, scrolling the thread to the latest message without an effect.
  const messageCount = selectedTicket?.messages?.length ?? 0
  const scrollAnchorRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && messageCount >= 0) {
        node.scrollIntoView({ behavior: 'smooth' })
      }
    },
    [messageCount]
  )

  const handleCreate = async (data: TicketFormData) => {
    if (!selectedCoproId) return
    await createTicket.mutateAsync({
      ...data,
      copropriete_id: selectedCoproId,
      auteur_id: user?.id,
    })
    patchUi({ showCreateDialog: false })
    createForm.reset()
  }

  const handleUpdate = async (data: UpdateTicketFormData) => {
    if (!editingTicket) return
    await updateTicket.mutateAsync({ id: editingTicket.id, data })
    patchUi({ showEditDialog: false })
    patchUi({ editingTicket: null })
  }

  const handleSendMessage = async () => {
    if (!selectedTicketId || !newMessage.trim()) return
    await addMessage.mutateAsync({
      ticketId: selectedTicketId,
      data: { contenu: newMessage.trim(), auteur_id: user?.id },
    })
    patchUi({ newMessage: '' })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Detail view
  if (selectedTicketId) {
    return (
      <div className="space-y-6">
        <TicketDetailPanel
          selectedTicket={selectedTicket}
          loadingDetail={loadingDetail}
          currentUserId={user?.id}
          newMessage={newMessage}
          isSending={addMessage.isPending}
          scrollAnchorRef={scrollAnchorRef}
          onBack={() => patchUi({ selectedTicketId: null })}
          onEdit={ticket => {
            patchUi({ editingTicket: ticket })
            patchUi({ showEditDialog: true })
          }}
          onDelete={id => patchUi({ deleteId: id })}
          onNewMessageChange={value => patchUi({ newMessage: value })}
          onKeyDown={handleKeyDown}
          onSendMessage={handleSendMessage}
        />

        {/* Edit dialog */}
        <FormDialog
          open={showEditDialog}
          onOpenChange={(open) => {
            patchUi({ showEditDialog: open })
            if (!open) patchUi({ editingTicket: null })
          }}
          title="Modifier le ticket"
          form={editForm}
          onSubmit={handleUpdate}
          isLoading={updateTicket.isPending}
        >
          <TicketEditFields control={editForm.control} />
        </FormDialog>
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Messagerie</h1>
          <p className="text-stone-500 dark:text-stone-400">
            Echangez avec les coproprietaires via des tickets de support
          </p>
        </div>
      </div>

      {isError && (
        <ErrorAlert error={error as Error} message="Impossible de charger les tickets" />
      )}

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <MessageSquare className="size-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
            Aucune copropriete selectionnee
          </h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">
            Selectionnez une copropriete dans le menu lateral.
          </p>
        </div>
      ) : (
        <TicketList
          tickets={tickets}
          isLoading={isLoading}
          onNew={() => {
            createForm.reset()
            patchUi({ showCreateDialog: true })
          }}
          onSelect={id => patchUi({ selectedTicketId: id })}
          onEdit={ticket => {
            patchUi({ editingTicket: ticket })
            patchUi({ showEditDialog: true })
          }}
          onDelete={id => patchUi({ deleteId: id })}
        />
      )}

      {/* Create dialog */}
      <FormDialog
        open={showCreateDialog}
        onOpenChange={v => patchUi({ showCreateDialog: v })}
        title="Nouveau ticket"
        description="Creer un nouveau ticket de support"
        form={createForm}
        onSubmit={handleCreate}
        isLoading={createTicket.isPending}
      >
        <TicketCreateFields control={createForm.control} />
      </FormDialog>

      {/* Edit dialog (list view) */}
      <FormDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          patchUi({ showEditDialog: open })
          if (!open) patchUi({ editingTicket: null })
        }}
        title="Modifier le ticket"
        form={editForm}
        onSubmit={handleUpdate}
        isLoading={updateTicket.isPending}
      >
        <TicketEditFields control={editForm.control} />
      </FormDialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && patchUi({ deleteId: null })}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => {
          deleteTicket.mutate(deleteId!, {
            onSuccess: () => patchUi({ selectedTicketId: null }),
          })
          patchUi({ deleteId: null })
        }}
      />
    </div>
  )
}
